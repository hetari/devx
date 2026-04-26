export const siteConfig = {
  name: 'AI Co-Founder',
  title: 'AI Co-Founder - Your AI business partner',
  description: 'A Nuxt 4 business dashboard for tracking cash flow, transactions, insights, and AI guidance.',
  url: 'https://ai-cofounder.local',
  ogImage: '/og-image.png',
  author: {
    name: 'AI Co-Founder Team',
    url: 'https://ai-cofounder.local',
  },
  links: {
    home: '/',
    dashboard: '/dashboard',
    transactions: '/transactions',
    insights: '/insights',
    chat: '/chat',
  },
  nav: [
    {
      label: 'Home',
      to: '/',
    },
    {
      label: 'Dashboard',
      to: '/dashboard',
    },
    {
      label: 'Transactions',
      to: '/transactions',
    },
    {
      label: 'Insights',
      to: '/insights',
    },
    {
      label: 'AI Chat',
      to: '/chat',
    },
  ],
} as const

export type SiteConfig = typeof siteConfig

export default siteConfig
