import prisma from '../utils/prisma'
import { z } from 'zod'

const insightSchema = z.object({
  whatHappened: z.string(),
  whyItMatters: z.string(),
  whatItMeans: z.string().optional(),
  whatToDo: z.string(),
  category: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = insightSchema.parse(body)

  return await prisma.insight.create({
    data: validatedData
  })
})
