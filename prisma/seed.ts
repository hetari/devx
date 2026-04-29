import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // Clear existing data
  await prisma.transaction.deleteMany()
  await prisma.insight.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.businessSettings.deleteMany()

  // Transactions
  await prisma.transaction.createMany({
    data: [
      { title: "Sold 10 items", time: "Today, 6:30 PM", doc: "Invoice #INV-1052", type: "revenue", amount: 100, category: "Sales" },
      { title: "Bought materials", time: "Today, 4:15 PM", doc: "Bill #BILL-2051", type: "expense", amount: 60, category: "Materials" },
      { title: "Sold 5 items", time: "Today, 11:20 AM", doc: "Invoice #INV-1051", type: "revenue", amount: 55, category: "Sales" },
      { title: "Delivery fee", time: "Yesterday, 3:45 PM", doc: "Expense", type: "expense", amount: 10, category: "Delivery" },
      { title: "Sold 8 items", time: "Yesterday, 1:30 PM", doc: "Invoice #INV-1050", type: "revenue", amount: 85, category: "Sales" },
      { title: "Bought packaging", time: "Yesterday, 11:00 AM", doc: "Bill #BILL-2050", type: "expense", amount: 25, category: "Other" },
      { title: "Sold 12 items", time: "Yesterday, 9:15 AM", doc: "Invoice #INV-1049", type: "revenue", amount: 350, category: "Sales" },
    ]
  })

  // Insights
  await prisma.insight.createMany({
    data: [
      {
        whatHappened: "Expenses are 63% of revenue this month.",
        whyItMatters: "High operational costs are eating into your margins.",
        whatItMeans: "Your current growth is not sustainable without cost optimization.",
        whatToDo: "Negotiate supplier pricing and group deliveries to reduce logistics costs.",
        category: "Cash Flow"
      }
    ]
  })

  // Goals
  await prisma.goal.createMany({
    data: [
      { title: "Increase monthly profit", current: 890, target: 2000, tone: "success", icon: "Target" },
      { title: "Reduce expenses", current: 1560, target: 1200, tone: "primary", icon: "Percent" },
      { title: "Save for new equipment", current: 300, target: 1500, tone: "info", icon: "ShoppingCart" },
    ]
  })

  // Settings
  await prisma.businessSettings.create({
    data: {
      companyName: "DevX Hackathon Corp",
      industry: "Technology",
      mission: "Building the next generation of AI business tools."
    }
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
