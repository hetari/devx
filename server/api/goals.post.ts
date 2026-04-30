// POST /api/goals
// Creates a new Goal, or updates an existing one when `id` is provided.
// One endpoint, two tools (create_goal + update_goal_progress + complete_goal)
// route through it based on which fields are present.
//
// Create:   { title, target, current?, unit?, tone?, icon? }
// Update:   { id, current?, target?, status? }   ("completed" closes the goal)

import { z } from 'zod';
import prisma from '../utils/prisma';

const createSchema = z.object({
  id: z.undefined().optional(),
  title: z.string().min(1),
  target: z.number(),
  current: z.number().optional(),
  unit: z.string().optional(),
  tone: z.enum(['primary', 'success', 'danger', 'info']).optional(),
  icon: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  current: z.number().optional(),
  target: z.number().optional(),
  status: z.enum(['active', 'completed']).optional(),
  unit: z.string().optional(),
  tone: z.string().optional(),
  icon: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (body && typeof body.id === 'string' && body.id.length > 0) {
    const data = updateSchema.parse(body);
    const updated = await prisma.goal.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.current !== undefined ? { current: data.current } : {}),
        ...(data.target !== undefined ? { target: data.target } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.tone !== undefined ? { tone: data.tone } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
      },
    });
    return { ok: true, goal: updated };
  }

  const data = createSchema.parse(body);
  const created = await prisma.goal.create({
    data: {
      title: data.title,
      target: data.target,
      current: data.current ?? 0,
      unit: data.unit ?? '$',
      tone: data.tone ?? 'primary',
      icon: data.icon ?? null,
    },
  });
  return { ok: true, goal: created };
});
