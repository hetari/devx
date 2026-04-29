// GET /api/budgets
// Returns autonomy budgets per agent, plus computed approval rates from
// recent BackgroundEvent decisions. Seeds defaults on first call so the
// Trust Dial UI always has rows to render.

import prisma from '../../utils/prisma';

const DEFAULT_BUDGETS: Array<{ agent: string; actionType: string; dailyCapAmount?: number; dailyCapCount?: number; requiresApprovalAbove?: number }> = [
  { agent: 'cfo',      actionType: 'send_invoice_reminder', dailyCapAmount: 500,  dailyCapCount: 5, requiresApprovalAbove: 500 },
  { agent: 'cfo',      actionType: 'flag_runway_risk',      dailyCapCount: 10 },
  { agent: 'cmo',      actionType: 'draft_social_post',     dailyCapCount: 3 },
  { agent: 'cmo',      actionType: 'pricing_opportunity',   dailyCapCount: 2 },
  { agent: 'operator', actionType: 'flag_supplier_price',   dailyCapCount: 5 },
  { agent: 'operator', actionType: 'suggest_reorder',       dailyCapAmount: 200, dailyCapCount: 3, requiresApprovalAbove: 200 },
];

async function ensureSeeded() {
  const count = await prisma.autonomyBudget.count();
  if (count > 0) return;
  for (const b of DEFAULT_BUDGETS) {
    await prisma.autonomyBudget.create({
      data: {
        agent: b.agent,
        actionType: b.actionType,
        dailyCapAmount: b.dailyCapAmount ?? null,
        dailyCapCount: b.dailyCapCount ?? null,
        requiresApprovalAbove: b.requiresApprovalAbove ?? null,
        enabled: true,
      },
    });
  }
}

async function approvalRateFor(agent: string): Promise<{ rate: number; sample: number }> {
  const recent = await prisma.backgroundEvent.findMany({
    where: { agent, status: { in: ['approved', 'rejected', 'executed'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { status: true },
  });
  if (!recent.length) return { rate: 0, sample: 0 };
  const positive = recent.filter((r) => r.status === 'approved' || r.status === 'executed').length;
  return { rate: Number((positive / recent.length).toFixed(2)), sample: recent.length };
}

export default defineEventHandler(async () => {
  await ensureSeeded();

  const budgets = await prisma.autonomyBudget.findMany({
    orderBy: [{ agent: 'asc' }, { actionType: 'asc' }],
  });

  const byAgent: Record<string, any[]> = {};
  for (const b of budgets) {
    (byAgent[b.agent] ??= []).push(b);
  }

  const agents = ['cfo', 'cmo', 'operator'];
  const result = await Promise.all(
    agents.map(async (a) => ({
      agent: a,
      approval: await approvalRateFor(a),
      budgets: byAgent[a] ?? [],
    }))
  );

  return result;
});
