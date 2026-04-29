import prisma from '../utils/prisma'
import { z } from 'zod'

const transactionSchema = z.object({
  title: z.string(),
  type: z.enum(['revenue', 'expense']),
  amount: z.number(),
  category: z.string(),
  description: z.string().optional(),
  time: z.string().optional(),
  doc: z.string().optional(),
  date: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = transactionSchema.parse(body)

  return await prisma.transaction.create({
    data: {
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date) : new Date()
    }
  })
})
