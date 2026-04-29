import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.goal.findMany({
    orderBy: { createdAt: 'desc' }
  })
})
