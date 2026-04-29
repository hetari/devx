// POST /api/night-shift/decide
// Approve, reject, or mark-as-executed a pending night-shift event. The Trust
// Dial increments approval rate using these decisions over a rolling window.

import { z } from 'zod';
import prisma from '../../utils/prisma';

const schema = z.object({
  eventId: z.string(),
  decision: z.enum(['approved', 'rejected', 'executed']),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { eventId, decision } = schema.parse(body);

  const existing = await prisma.backgroundEvent.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' });
  }

  const updated = await prisma.backgroundEvent.update({
    where: { id: eventId },
    data: { status: decision },
  });

  // Recompute approval rate for this agent's most-frequent action type.
  // Cheap rolling window over the last 50 events for this agent.
  const recent = await prisma.backgroundEvent.findMany({
    where: {
      agent: existing.agent,
      status: { in: ['approved', 'rejected', 'executed'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { status: true },
  });
  if (recent.length > 0) {
    const positive = recent.filter((r) => r.status === 'approved' || r.status === 'executed').length;
    const rate = positive / recent.length;

    // Best-effort: write the rolling rate to any existing budget row for this agent.
    await prisma.autonomyBudget.updateMany({
      where: { agent: existing.agent },
      data: { approvalRate: Number(rate.toFixed(2)) },
    });
  }

  return { ok: true, event: updated };
});
