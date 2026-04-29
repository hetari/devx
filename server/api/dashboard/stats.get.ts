import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const transactions = await prisma.transaction.findMany()

  const revenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((acc, t) => acc + t.amount, 0)

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const profit = revenue - expenses
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

  return {
    kpis: [
      { title: "Revenue", value: revenue, change: "18.2%", icon: "TrendingUp", tone: "success" },
      { title: "Expenses", value: expenses, change: "12.4%", icon: "TrendingDown", tone: "danger" },
      { title: "Profit", value: profit, change: "24.1%", icon: "Wallet", tone: "info" },
      { title: "Profit Margin", value: profitMargin.toFixed(1) + "%", change: "6.3%", icon: "Percent", tone: "primary" },
    ],
    // For chart data, we can aggregate by day
    chartData: aggregateByDay(transactions)
  }
})

function aggregateByDay(transactions: any[]) {
  const days: Record<string, { day: string, revenue: number, expenses: number, profit: number }> = {}
  
  // Get last 7 days of data
  transactions.forEach(t => {
    const day = t.date.toISOString().split('T')[0]
    if (!days[day]) {
      days[day] = { day, revenue: 0, expenses: 0, profit: 0 }
    }
    if (t.type === 'revenue') days[day].revenue += t.amount
    else days[day].expenses += t.amount
    days[day].profit = days[day].revenue - days[day].expenses
  })

  return Object.values(days).sort((a, b) => a.day.localeCompare(b.day))
}
