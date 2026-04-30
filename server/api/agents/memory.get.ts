// GET /api/agents/memory?agent=cfo&topic=pricing&limit=5
// Lightweight memory recall: returns AgentMemory entries for the given
// agent whose content matches the topic substring (case-insensitive).
// Used by the recall_decision live tool so agents can answer
// "what did we decide about X" with real persisted history.

import prisma from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const agent = String(q.agent ?? '').toLowerCase();
  const topic = String(q.topic ?? '').trim();
  const limit = Math.min(Math.max(Number(q.limit) || 5, 1), 20);

  if (!['chair', 'cfo', 'cmo', 'operator'].includes(agent)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid agent id.' });
  }

  const where: any = { agent };
  if (topic) {
    // SQLite Prisma doesn't support `mode: 'insensitive'`; use LIKE-style
    // contains. Most stored content is Arabic/mixed, contains is good
    // enough for the demo.
    where.content = { contains: topic };
  }

  const rows = await prisma.agentMemory.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, type: true, content: true, relatedId: true, createdAt: true },
  });

  return {
    agent,
    topic: topic || null,
    count: rows.length,
    memories: rows,
  };
});
