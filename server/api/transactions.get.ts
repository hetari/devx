import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 10

  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: limit
  })
})
