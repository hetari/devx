// POST /api/agents/draft
// Lets a specialist agent draft an action during a live voice session.
// The draft becomes a pending BackgroundEvent that the user sees in the
// dashboard's NightShiftFeed where they can approve or reject it.
//
// Body: { agent, actionType, topic, payload }
//   agent       — "cfo" | "cmo" | "operator"
//   actionType  — e.g. "draft_invoice_reminder", "draft_social_post", "suggest_reorder"
//   topic       — short Arabic title shown in the feed
//   payload     — arbitrary structured details (subject/body, item/qty/cost, etc.)

import { z } from 'zod';
import prisma from '../../utils/prisma';

const schema = z.object({
  agent: z.enum(['cfo', 'cmo', 'operator']),
  actionType: z.enum([
    'draft_invoice_reminder',
    'draft_social_post',
    'suggest_reorder',
  ]),
  topic: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// Per-agent allow-list so the CFO can't accidentally draft a social post,
// and the CMO can't initiate a supplier reorder. Keeps each specialist
// strictly inside their domain.
const ALLOWED_BY_AGENT: Record<string, string[]> = {
  cfo: ['draft_invoice_reminder'],
  cmo: ['draft_social_post'],
  operator: ['suggest_reorder'],
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { agent, actionType, topic, payload } = schema.parse(body);

  if (!ALLOWED_BY_AGENT[agent]?.includes(actionType)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Agent "${agent}" is not allowed to take action "${actionType}".`,
    });
  }

  const row = await prisma.backgroundEvent.create({
    data: {
      agent,
      eventType: 'action',
      topic,
      payloadJson: JSON.stringify({ severity: 'medium', actionType, ...(payload ?? {}) }),
      actionTaken: `Drafted ${actionType} during a live voice session.`,
      status: 'pending',
    },
  });

  return {
    ok: true,
    event: {
      id: row.id,
      agent: row.agent,
      eventType: row.eventType,
      topic: row.topic,
      payload: JSON.parse(row.payloadJson),
      status: row.status,
      createdAt: row.createdAt,
    },
  };
});
