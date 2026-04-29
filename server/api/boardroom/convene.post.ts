// POST /api/boardroom/convene
// Orchestrates 2-3 specialist agents in parallel for a single Boardroom session.
// Each agent gets its own Gemini call with persona + business snapshot + memory.
// Returns the stances + a fresh BoardroomSession id the UI uses to record the
// user's decision via /api/boardroom/decide.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { SERVER_PERSONAS, pickRelevantAgents, getFallbackStance, type ServerAgentId } from '../../utils/agentPrompts';
import { getBusinessSnapshot } from '../../utils/businessContext';
import { callGeminiResilient } from '../../utils/geminiRetry';

const requestSchema = z.object({
  topic: z.string().min(1),
  trigger: z.enum(['user', 'background', 'scheduled']).default('user'),
  agents: z.array(z.enum(['cfo', 'cmo', 'operator'])).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

interface AgentStancePayload {
  agentId: ServerAgentId;
  arabicName: string;
  textArabic: string;
  suggestedAction: { label: string; detail: string } | null;
  confidence: number;
  agreesWith: ServerAgentId[];
  disagreesWith: ServerAgentId[];
}

function safeJsonParse<T = unknown>(text: string): T | null {
  // Models occasionally wrap JSON in ```json fences. Strip them defensively.
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

async function getAgentMemorySnippet(agentId: ServerAgentId): Promise<string> {
  const recent = await prisma.agentMemory.findMany({
    where: { agent: agentId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { type: true, content: true },
  });
  if (!recent.length) return 'لا توجد ذكريات سابقة بعد.';
  return recent
    .map((m) => `- (${m.type}) ${m.content}`)
    .join('\n');
}

// Heuristic fallback parser for when Gemini ignores responseMimeType and
// emits a plain-text answer instead of JSON. We grab the longest non-empty
// line that isn't obviously meta and treat it as the stance. Crude but
// keeps the demo alive when the model misbehaves.
function plaintextStanceFallback(text: string): string | null {
  if (!text) return null;
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  // Skip lines that are obviously structural (braces, "stance:" keys, etc.)
  const lines = cleaned
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[-*•]\s*/, '').trim())
    .filter((l) => l && !/^[{}\[\],"]/.test(l) && !/^\s*"?(stance|suggestedAction|confidence)"?\s*:/i.test(l));
  // Prefer the longest meaningful line.
  const candidate = lines.sort((a, b) => b.length - a.length)[0];
  if (!candidate) return null;
  // Strip surrounding quotes/JSON syntax remnants.
  return candidate.replace(/^["']|["']$/g, '').replace(/[",}\]]+$/g, '').trim() || null;
}

async function getAgentStance(
  ai: GoogleGenerativeAI,
  agentId: ServerAgentId,
  topic: string,
  snapshot: unknown,
): Promise<AgentStancePayload> {
  const persona = SERVER_PERSONAS[agentId];
  const memory = await getAgentMemorySnippet(agentId);

  const userPrompt = `
موضوع المجلس: ${topic}

سياق العمل (أرقام آخر 30 يوم):
${JSON.stringify(snapshot, null, 2)}

ذاكرتك من جلسات سابقة (إن وجدت):
${memory}

أعطني موقفك بصيغة JSON المطلوبة فقط. لا تترك stance فارغاً أبداً.
`.trim();

  type Parsed = {
    stance?: string;
    suggestedAction?: { label?: string; detail?: string } | null;
    confidence?: number;
  };

  let stance = '';
  let action: { label: string; detail: string } | null = null;
  let confidence = 0.6;
  let lastError: any = null;

  // Single pass — JSON mode primary, plain-text salvage if the model didn't
  // emit valid JSON. We deliberately keep this to ONE network round trip per
  // agent to stay within free-tier quota; the resilient layer inside handles
  // model fallback and transient-error retries on its own.
  try {
    const text = await callGeminiResilient(ai, {
      systemInstruction: persona.systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 500,
      },
      contents: userPrompt,
      maxAttemptsPerModel: 1,
    });

    const parsed = safeJsonParse<Parsed>(text);
    const candidate = parsed?.stance?.toString().trim();
    if (candidate) {
      stance = candidate;
      action = parsed?.suggestedAction && parsed.suggestedAction.label
        ? { label: parsed.suggestedAction.label, detail: parsed.suggestedAction.detail || '' }
        : null;
      confidence = typeof parsed?.confidence === 'number'
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.6;
    } else {
      // JSON didn't parse or had empty stance — salvage from raw text.
      const salvaged = plaintextStanceFallback(text);
      if (salvaged) stance = salvaged;
    }
  } catch (err) {
    lastError = err;
  }

  if (!stance) {
    // Truly hopeless: use a hardcoded persona-flavored line so the user never
    // sees an apology bubble. Marks confidence 0 so the UI could downplay it.
    stance = getFallbackStance(agentId);
    confidence = 0;
    if (lastError) console.warn(`[boardroom] ${agentId} fallback engaged:`, lastError?.message ?? lastError);
  }

  return {
    agentId,
    arabicName: persona.arabicName,
    textArabic: stance,
    suggestedAction: action,
    confidence,
    agreesWith: [],
    disagreesWith: [],
  };
}

// Lightweight post-hoc analysis: ask a small model who agrees/disagrees with whom.
// Skipped when any stance has confidence 0 (= we used the persona fallback,
// so there's nothing real to compare) — saves a quota-burning extra call.
async function annotateAgreement(
  ai: GoogleGenerativeAI,
  stances: AgentStancePayload[],
): Promise<AgentStancePayload[]> {
  if (stances.length < 2) return stances;
  if (stances.some((s) => s.confidence === 0)) return stances;

  const prompt = `
لدينا ${stances.length} مواقف من أعضاء مجلس الإدارة على نفس السؤال. حدد من يتفق مع من ومن يختلف.

المواقف:
${stances.map((s) => `${s.agentId} (${s.arabicName}): ${s.textArabic}`).join('\n')}

أعد فقط JSON بهذا الشكل بدون أي نص آخر:
{
  "pairs": [
    { "a": "cfo", "b": "cmo", "relation": "agree" | "disagree" }
  ]
}
حدد العلاقة فقط حين تكون واضحة. الأعضاء الذين لم يذكروا في pairs يعتبرون محايدين تجاه بعضهم.
`.trim();

  try {
    const text = await callGeminiResilient(ai, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 300 },
      contents: prompt,
      maxAttemptsPerModel: 1,
    });
    const parsed = safeJsonParse<{ pairs?: Array<{ a: string; b: string; relation: string }> }>(text);
    const pairs = parsed?.pairs ?? [];

    const byId: Record<string, AgentStancePayload> = {};
    stances.forEach((s) => { byId[s.agentId] = s; });

    for (const p of pairs) {
      const a = byId[p.a];
      const b = byId[p.b];
      if (!a || !b) continue;
      if (p.relation === 'agree') {
        if (!a.agreesWith.includes(b.agentId)) a.agreesWith.push(b.agentId);
        if (!b.agreesWith.includes(a.agentId)) b.agreesWith.push(a.agentId);
      } else if (p.relation === 'disagree') {
        if (!a.disagreesWith.includes(b.agentId)) a.disagreesWith.push(b.agentId);
        if (!b.disagreesWith.includes(a.agentId)) b.disagreesWith.push(a.agentId);
      }
    }
    return stances;
  } catch {
    // Annotation is best-effort; on failure, return raw stances.
    return stances;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).geminiApiKey || config.public.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY missing in runtime config' });
  }

  const body = await readBody(event);
  const { topic, trigger, agents } = requestSchema.parse(body);
  const chosen = (agents && agents.length ? agents : pickRelevantAgents(topic)) as ServerAgentId[];

  const ai = new GoogleGenerativeAI(apiKey);
  const snapshot = await getBusinessSnapshot();

  // Run all agent stances in parallel. If any single agent's whole pipeline
  // throws, fall back to a persona-flavored stance — never an apology bubble.
  const stancesRaw = await Promise.all(
    chosen.map(async (id) => {
      try {
        return await getAgentStance(ai, id, topic, snapshot);
      } catch (err: any) {
        console.warn(`[boardroom] ${id} stance hard-failed:`, err?.message ?? err);
        const persona = SERVER_PERSONAS[id];
        return {
          agentId: id,
          arabicName: persona.arabicName,
          textArabic: getFallbackStance(id),
          suggestedAction: null,
          confidence: 0,
          agreesWith: [] as ServerAgentId[],
          disagreesWith: [] as ServerAgentId[],
        };
      }
    })
  );
  const stances = await annotateAgreement(ai, stancesRaw);

  const session = await prisma.boardroomSession.create({
    data: {
      trigger,
      topic,
      agentsInvolved: JSON.stringify(chosen),
      stancesJson: JSON.stringify(stances),
    },
  });

  return {
    sessionId: session.id,
    topic,
    stances: stances.map((s) => ({
      agentId: s.agentId,
      arabicName: s.arabicName,
      textArabic: s.textArabic,
      suggestedAction: s.suggestedAction,
      agreesWith: s.agreesWith,
      disagreesWith: s.disagreesWith,
    })),
  };
});
