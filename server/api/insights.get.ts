import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.insight.findMany({
    orderBy: { timestamp: 'desc' }
  })
})
