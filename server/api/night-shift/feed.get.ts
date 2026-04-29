// GET /api/night-shift/feed
// Returns the most recent night-shift events for display in the dashboard
// "while you slept" feed. Optional query params:
//   ?limit=20            cap result count
//   ?status=pending      filter to pending/approved/etc.
//   ?since=2026-04-29    ISO date lower bound

import prisma from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const limit = Math.min(Number(q.limit) || 20, 100);
  const status = typeof q.status === 'string' ? q.status : undefined;
  const since = typeof q.since === 'string' ? new Date(q.since) : undefined;

  const rows = await prisma.backgroundEvent.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(since && !isNaN(since.getTime()) ? { createdAt: { gte: since } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    agent: r.agent,
    eventType: r.eventType,
    topic: r.topic,
    payload: (() => { try { return JSON.parse(r.payloadJson); } catch { return {}; } })(),
    actionTaken: r.actionTaken,
    status: r.status,
    createdAt: r.createdAt,
  }));
});
