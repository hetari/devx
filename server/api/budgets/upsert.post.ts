// POST /api/budgets/upsert
// Updates one autonomy-budget row. The Trust Dial UI calls this per row
// when the user moves a slider or toggles a switch.

import { z } from 'zod';
import prisma from '../../utils/prisma';

const schema = z.object({
  agent: z.enum(['cfo', 'cmo', 'operator']),
  actionType: z.string().min(1),
  dailyCapAmount: z.number().nullable().optional(),
  dailyCapCount: z.number().int().nullable().optional(),
  requiresApprovalAbove: z.number().nullable().optional(),
  enabled: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = schema.parse(body);

  const row = await prisma.autonomyBudget.upsert({
    where: { agent_actionType: { agent: data.agent, actionType: data.actionType } },
    update: {
      dailyCapAmount: data.dailyCapAmount ?? null,
      dailyCapCount: data.dailyCapCount ?? null,
      requiresApprovalAbove: data.requiresApprovalAbove ?? null,
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
    },
    create: {
      agent: data.agent,
      actionType: data.actionType,
      dailyCapAmount: data.dailyCapAmount ?? null,
      dailyCapCount: data.dailyCapCount ?? null,
      requiresApprovalAbove: data.requiresApprovalAbove ?? null,
      enabled: data.enabled ?? true,
    },
  });

  return { ok: true, budget: row };
});
