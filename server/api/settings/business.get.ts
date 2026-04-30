// GET /api/settings/business
// Returns the BusinessSettings row, creating the default one on first call.
// The model uses a fixed singleton id ("config") so there's never more
// than one row.

import prisma from '../../utils/prisma';

export default defineEventHandler(async () => {
  const existing = await prisma.businessSettings.findUnique({ where: { id: 'config' } });
  if (existing) return existing;

  // First call ever — seed the singleton with defaults.
  return await prisma.businessSettings.create({ data: { id: 'config' } });
});
