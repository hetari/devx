// POST /api/settings/business
// Upserts the BusinessSettings singleton. Any field not provided is left
// untouched; pass `null` to explicitly clear an optional field.

import { z } from 'zod';
import prisma from '../../utils/prisma';

const schema = z.object({
  companyName: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  currency: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = schema.parse(body);

  const updateData: Record<string, any> = {};
  if (data.companyName !== undefined) updateData.companyName = data.companyName;
  if (data.industry !== undefined)    updateData.industry = data.industry;
  if (data.mission !== undefined)     updateData.mission = data.mission;
  if (data.currency !== undefined)    updateData.currency = data.currency;

  const row = await prisma.businessSettings.upsert({
    where: { id: 'config' },
    update: updateData,
    create: {
      id: 'config',
      companyName: data.companyName ?? 'My Business',
      industry: data.industry ?? null,
      mission: data.mission ?? null,
      currency: data.currency ?? 'USD',
    },
  });
  return { ok: true, settings: row };
});
