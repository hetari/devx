import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Megaphone,
  Package,
  Percent,
  ReceiptText,
  Repeat2,
  Settings,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-vue-next"

export const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", to: "/transactions", icon: Repeat2 },
  { label: "Insights", to: "/insights", icon: BarChart3 },
  { label: "AI Chat", to: "/chat", icon: Bot },
  { label: "Learn", to: "/learn", icon: BookOpen },
  { label: "Goals", to: "/goals", icon: Target },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings },
] as const

export const kpis = [
  { title: "Revenue", value: "$2,450.00", change: "18.2%", icon: TrendingUp, tone: "success" },
  { title: "Expenses", value: "$1,560.00", change: "12.4%", icon: TrendingDown, tone: "danger" },
  { title: "Profit", value: "$890.00", change: "24.1%", icon: Wallet, tone: "info" },
  { title: "Profit Margin", value: "36.3%", change: "6.3%", icon: Percent, tone: "primary" },
] as const

export const cashData = [
  { day: "May 1", revenue: 900, expenses: 200, profit: -450 },
  { day: "May 6", revenue: 1450, expenses: 700, profit: -50 },
  { day: "May 11", revenue: 1900, expenses: 900, profit: 100 },
  { day: "May 16", revenue: 2100, expenses: 1150, profit: 320 },
  { day: "May 21", revenue: 2500, expenses: 1550, profit: 500 },
  { day: "May 26", revenue: 2600, expenses: 1700, profit: 620 },
  { day: "May 31", revenue: 3250, expenses: 2250, profit: 1050 },
] as const

export const transactions = [
  { title: "Sold 10 items", time: "Today, 6:30 PM", doc: "Invoice #INV-1052", type: "Revenue", amount: 100, icon: TrendingUp, tone: "success" },
  { title: "Bought materials", time: "Today, 4:15 PM", doc: "Bill #BILL-2051", type: "Expense", amount: -60, icon: ShoppingCart, tone: "danger" },
  { title: "Sold 5 items", time: "Today, 11:20 AM", doc: "Invoice #INV-1051", type: "Revenue", amount: 55, icon: TrendingUp, tone: "success" },
  { title: "Delivery fee", time: "Yesterday, 3:45 PM", doc: "Expense", type: "Expense", amount: -10, icon: Truck, tone: "primary" },
  { title: "Sold 8 items", time: "Yesterday, 1:30 PM", doc: "Invoice #INV-1050", type: "Revenue", amount: 85, icon: TrendingUp, tone: "success" },
  { title: "Bought packaging", time: "Yesterday, 11:00 AM", doc: "Bill #BILL-2050", type: "Expense", amount: -25, icon: Package, tone: "danger" },
  { title: "Sold 12 items", time: "Yesterday, 9:15 AM", doc: "Invoice #INV-1049", type: "Revenue", amount: 350, icon: TrendingUp, tone: "success" },
] as const

export const categories = [
  { name: "Materials", value: 620, percent: 39.7, icon: Package, tone: "warning" },
  { name: "Delivery", value: 280, percent: 17.9, icon: Truck, tone: "info" },
  { name: "Marketing", value: 210, percent: 13.5, icon: Megaphone, tone: "primary" },
  { name: "Utilities", value: 180, percent: 11.5, icon: Zap, tone: "danger" },
  { name: "Other", value: 270, percent: 17.4, icon: ReceiptText, tone: "muted" },
] as const

export const goals = [
  { title: "Increase monthly profit", value: "$890 / $2,000", progress: 45, icon: Target, tone: "success" },
  { title: "Reduce expenses", value: "$1,560 / $1,200", progress: 30, icon: Percent, tone: "primary" },
  { title: "Save for new equipment", value: "$300 / $1,500", progress: 20, icon: ShoppingCart, tone: "info" },
] as const

export const lessons = [
  { title: "Understanding Cash Flow", progress: 75, icon: BarChart3 },
  { title: "Managing Expenses Effectively", progress: 40, icon: Percent },
  { title: "Pricing Strategies That Work", progress: 20, icon: GraduationCap },
] as const
