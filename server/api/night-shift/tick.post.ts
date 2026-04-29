// POST /api/night-shift/tick
// Runs one cycle of the night-shift loop. Each specialist agent inspects the
// business snapshot from its own bias and produces 0-3 events. Events are
// persisted as BackgroundEvent rows so the user sees them in the morning feed.
//
// For the hackathon demo, this endpoint is also called manually from the UI
// ("Wake the Night Shift") so the audience can see the feed populate live.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { SERVER_PERSONAS, type ServerAgentId } from '../../utils/agentPrompts';
import { getBusinessSnapshot } from '../../utils/businessContext';
import { callGeminiResilient } from '../../utils/geminiRetry';

const requestSchema = z.object({
  agents: z.array(z.enum(['cfo', 'cmo', 'operator'])).optional(),
});

interface NightShiftEvent {
  eventType: 'note' | 'brief' | 'action' | 'convene';
  topic: string;
  severity: 'low' | 'medium' | 'high';
  payload: Record<string, unknown>;
  actionTaken?: string;
}

const NIGHT_SHIFT_SCHEMA_BY_AGENT: Record<ServerAgentId, string> = {
  cfo: `
الإجراءات المتاحة لك (actionType):
- "draft_invoice_reminder" — مسودة تذكير فاتورة لعميل متأخر. payload يحتوي على: customer, amount, daysLate, subject (عربي قصير), body (نص رسالة الايميل).
- "flag_runway_risk" — تحذير من ضعف الفترة النقدية المتبقية. payload: runwayDays (تقدير), reason.
- "margin_brief" — موجز عن هامش الربح. payload: marginPct, change, note.
- "convene" — اطلب اجتماع مجلس فوراً. payload: topic.`,
  cmo: `
الإجراءات المتاحة لك (actionType):
- "draft_social_post" — مسودة منشور لوسائل التواصل. payload: channel, body (≤280 char), suggestedTime.
- "pricing_opportunity" — فرصة تسعير. payload: idea, expectedImpact.
- "promo_idea" — فكرة عرض ترويجي. payload: name, description, cost.
- "convene" — اطلب اجتماع مجلس فوراً. payload: topic.`,
  operator: `
الإجراءات المتاحة لك (actionType):
- "flag_supplier_price" — تنبيه بتغير سعر مورد. payload: supplier, oldPrice, newPrice, deltaPct.
- "inventory_risk" — تحذير من نقص المخزون. payload: item, daysLeft.
- "suggest_reorder" — اقتراح إعادة طلب. payload: item, quantity, estimatedCost.
- "convene" — اطلب اجتماع مجلس فوراً. payload: topic.`,
};

function safeJsonParse<T = unknown>(text: string): T | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

async function getAgentEvents(
  ai: GoogleGenerativeAI,
  agentId: ServerAgentId,
  snapshot: unknown,
): Promise<NightShiftEvent[]> {
  const persona = SERVER_PERSONAS[agentId];
  const actions = NIGHT_SHIFT_SCHEMA_BY_AGENT[agentId];

  const prompt = `
أنت في وردية ليلية. تحلل بيانات العمل بنفسك دون أن يطلب منك المؤسس شيئاً.
سياق العمل:
${JSON.stringify(snapshot, null, 2)}

${actions}

أعطني ما بين 1 و 3 أحداث ينبغي أن يعرفها المؤسس صباحاً.
أعد JSON بهذا الشكل فقط:
{
  "events": [
    {
      "eventType": "note" | "brief" | "action" | "convene",
      "topic": "وصف مختصر بالعربية",
      "severity": "low" | "medium" | "high",
      "actionType": "draft_invoice_reminder" أو غيرها من القائمة أعلاه (إن لزم),
      "payload": { ... },
      "actionTaken": "وصف بالعربية لما فعلته فعلياً (للأحداث من نوع action فقط)"
    }
  ]
}
- "note" = ملاحظة صامتة
- "brief" = نقطة في موجز الصباح
- "action" = إجراء قمت به (مع payload يصف المسودة)
- "convene" = أطلب اجتماع مجلس
لا تختلق بيانات لا توجد. إذا الأرقام لا تكفي للتصرف، أعد فقط "note" واحد بسيط.
`.trim();

  try {
    const text = await callGeminiResilient(ai, {
      systemInstruction: persona.systemPrompt,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 1200 },
      contents: prompt,
      maxAttemptsPerModel: 1,
    });
    const parsed = safeJsonParse<{ events?: any[] }>(text);
    const events = (parsed?.events ?? []).slice(0, 3);
    return events.map((e: any) => ({
      eventType: ['note', 'brief', 'action', 'convene'].includes(e.eventType) ? e.eventType : 'brief',
      topic: String(e.topic || 'بدون عنوان'),
      severity: ['low', 'medium', 'high'].includes(e.severity) ? e.severity : 'low',
      payload: { actionType: e.actionType, ...(e.payload ?? {}) },
      actionTaken: e.actionTaken,
    }));
  } catch {
    return [];
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).geminiApiKey || config.public.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY missing in runtime config' });
  }

  const body = await readBody(event).catch(() => ({}));
  const { agents } = requestSchema.parse(body || {});
  const chosen: ServerAgentId[] = (agents && agents.length ? agents : ['cfo', 'cmo', 'operator']) as ServerAgentId[];

  const ai = new GoogleGenerativeAI(apiKey);
  const snapshot = await getBusinessSnapshot();

  const eventsPerAgent = await Promise.all(chosen.map(async (id) => ({ id, events: await getAgentEvents(ai, id, snapshot) })));

  const persisted: any[] = [];
  for (const { id: agentId, events } of eventsPerAgent) {
    for (const ev of events) {
      const row = await prisma.backgroundEvent.create({
        data: {
          agent: agentId,
          eventType: ev.eventType,
          topic: ev.topic,
          payloadJson: JSON.stringify({ severity: ev.severity, ...ev.payload }),
          actionTaken: ev.actionTaken ?? null,
          status: ev.eventType === 'action' ? 'pending' : 'executed',
        },
      });
      persisted.push(row);
    }
  }

  return {
    ok: true,
    count: persisted.length,
    events: persisted.map((r) => ({
      id: r.id,
      agent: r.agent,
      eventType: r.eventType,
      topic: r.topic,
      payload: JSON.parse(r.payloadJson),
      actionTaken: r.actionTaken,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
});
