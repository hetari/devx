// Pulls a compact, JSON-serializable snapshot of the business so each agent gets
// real numbers in their context window. Kept small on purpose — agents argue better
// with one screen of facts than with a database dump.

import prisma from './prisma';

export interface BusinessSnapshot {
  totals: {
    revenue30d: number;
    expense30d: number;
    profit30d: number;
    profitMargin: number; // 0..1
  };
  recent: {
    transactions: Array<{ title: string; type: string; amount: number; category: string; date: string }>;
    insights: Array<{ whatHappened: string; whyItMatters: string }>;
  };
  goals: Array<{ title: string; current: number; target: number; status: string }>;
  agendaBreaches: Array<{ agent: string; watchTarget: string; currentValue: number | null; status: string }>;
}

export async function getBusinessSnapshot(): Promise<BusinessSnapshot> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [transactions, recentTxs, insights, goals, agenda] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: since } },
      select: { type: true, amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 10,
      select: { title: true, type: true, amount: true, category: true, date: true },
    }),
    prisma.insight.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: { whatHappened: true, whyItMatters: true },
    }),
    prisma.goal.findMany({
      where: { status: 'active' },
      select: { title: true, current: true, target: true, status: true },
    }),
    prisma.agendaItem.findMany({
      where: { status: { in: ['warning', 'breached'] } },
      select: { agent: true, watchTarget: true, currentValue: true, status: true },
    }),
  ]);

  let revenue = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'revenue') revenue += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  }
  const profit = revenue - expense;
  const profitMargin = revenue > 0 ? profit / revenue : 0;

  return {
    totals: {
      revenue30d: Number(revenue.toFixed(2)),
      expense30d: Number(expense.toFixed(2)),
      profit30d: Number(profit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(3)),
    },
    recent: {
      transactions: recentTxs.map((t) => ({
        title: t.title,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date.toISOString().slice(0, 10),
      })),
      insights: insights.map((i) => ({ whatHappened: i.whatHappened, whyItMatters: i.whyItMatters })),
    },
    goals: goals.map((g) => ({ title: g.title, current: g.current, target: g.target, status: g.status })),
    agendaBreaches: agenda.map((a) => ({
      agent: a.agent,
      watchTarget: a.watchTarget,
      currentValue: a.currentValue,
      status: a.status,
    })),
  };
}
