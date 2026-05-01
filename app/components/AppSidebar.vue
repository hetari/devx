<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import {
  Bot,
  Building2,
  GraduationCap,
  Home,
  PieChart,
  Repeat2,
  Settings,
  ShoppingCart,
  Wallet,
} from "lucide-vue-next";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const data = {
  user: {
    name: "إبراهيم الحتري",
    email: "hetari@devx.com",
    avatar: "",
  },
  teams: [
    {
      name: "شريكك",
      logo: Building2,
      plan: "مساعدك التجاري الذكي",
    },
    {
      name: "شريكك للتجزئة",
      logo: ShoppingCart,
      plan: "مساحة المبيعات",
    },
  ],
  navMain: [
    {
      title: "الأعمال",
      url: "/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "الرئيسية",
          url: "/",
        },
        {
          title: "لوحة التحكم",
          url: "/dashboard",
        },
        {
          title: "المعاملات",
          url: "/transactions",
        },
      ],
    },
    {
      title: "المال",
      url: "/dashboard",
      icon: Wallet,
      items: [
        {
          title: "التدفق النقدي",
          url: "/dashboard",
        },
        {
          title: "التقارير",
          url: "/reports",
        },
        {
          title: "الأهداف",
          url: "/goals",
        },
      ],
    },
    {
      title: "الشريك الذكي",
      url: "/chat",
      icon: Bot,
      items: [
        {
          title: "دردشة الذكاء",
          url: "/chat",
        },
        {
          title: "الرؤى",
          url: "/insights",
        },
        {
          title: "التعلم",
          url: "/learn",
        },
      ],
    },
    {
      title: "الإعدادات",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "ملف النشاط",
          url: "/settings",
        },
        {
          title: "التفضيلات",
          url: "/settings",
        },
        {
          title: "الإشعارات",
          url: "/settings",
        },
      ],
    },
  ],
  projects: [
    {
      name: "متعقب المبيعات",
      url: "/transactions",
      icon: Repeat2,
    },
    {
      name: "فئات المصروفات",
      url: "/reports",
      icon: PieChart,
    },
    {
      name: "خطة التعلم",
      url: "/learn",
      icon: GraduationCap,
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
