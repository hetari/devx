// POST /api/boardroom/decide
// Records the user's verdict on a Boardroom session and persists Decision-type
// memory entries for each agent that participated, so the cast remembers what
// the user chose (and overrode) the next time it convenes.

import { z } from 'zod';
import prisma from '../../utils/prisma';

const schema = z.object({
  sessionId: z.string(),
  decision: z.enum(['approved', 'override', 'dismissed']),
  approvedAgent: z.enum(['cfo', 'cmo', 'operator']).optional(),
  overrideText: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { sessionId, decision, approvedAgent, overrideText } = schema.parse(body);

  const session = await prisma.boardroomSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Boardroom session not found' });
  }

  let userDecisionEncoded: string;
  let outcomeSummary: string;

  if (decision === 'approved') {
    if (!approvedAgent) {
      throw createError({ statusCode: 400, statusMessage: 'approvedAgent is required when decision = approved' });
    }
    userDecisionEncoded = `approved:${approvedAgent}`;
    outcomeSummary = `وافق المؤسس على موقف ${approvedAgent}.`;
  } else if (decision === 'override') {
    userDecisionEncoded = 'override';
    outcomeSummary = `قرر المؤسس بنفسه: ${overrideText ?? '(بدون تفصيل)'}.`;
  } else {
    userDecisionEncoded = 'dismissed';
    outcomeSummary = 'أجل المؤسس القرار.';
  }

  await prisma.boardroomSession.update({
    where: { id: sessionId },
    data: { userDecision: userDecisionEncoded, overrideText: overrideText ?? null, outcomeSummary },
  });

  // Persist a Decision-type memory entry per agent involved, so they each
  // remember what happened on this topic from their own perspective.
  const involved: string[] = (() => {
    try { return JSON.parse(session.agentsInvolved) as string[]; } catch { return []; }
  })();

  for (const agentId of involved) {
    await prisma.agentMemory.create({
      data: {
        agent: agentId,
        type: 'decision',
        content: `الموضوع: "${session.topic}". ${outcomeSummary}`,
        relatedId: sessionId,
      },
    });
  }

  return { ok: true, outcomeSummary };
});
