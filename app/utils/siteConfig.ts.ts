export const siteConfig = {
  name: 'شريكك',
  title: 'شريكك - مساعدك التجاري الذكي',
  description: 'لوحة أعمال مبنية بـ Nuxt 4 لتتبع التدفق النقدي والمعاملات والرؤى والإرشاد الذكي.',
  url: 'https://sharikak.local',
  ogImage: '/og-image.png',
  author: {
    name: 'فريق شريكك',
    url: 'https://sharikak.local',
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
      label: 'الرئيسية',
      to: '/',
    },
    {
      label: 'لوحة التحكم',
      to: '/dashboard',
    },
    {
      label: 'المعاملات',
      to: '/transactions',
    },
    {
      label: 'الرؤى',
      to: '/insights',
    },
    {
      label: 'دردشة الذكاء',
      to: '/chat',
    },
  ],
} as const

export type SiteConfig = typeof siteConfig

export default siteConfig
