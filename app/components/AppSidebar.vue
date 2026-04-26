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
  Truck,
  Wallet,
} from "lucide-vue-next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const data = {
  user: {
    name: "Tariq Khan",
    email: "owner@atule.local",
    avatar: "",
  },
  teams: [
    {
      name: "Atule",
      logo: Building2,
      plan: "AI Business Partner",
    },
    {
      name: "Atule Retail",
      logo: ShoppingCart,
      plan: "Sales workspace",
    },
    {
      name: "Atule Delivery",
      logo: Truck,
      plan: "Operations",
    },
  ],
  navMain: [
    {
      title: "Business",
      url: "/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Transactions",
          url: "/transactions",
        },
      ],
    },
    {
      title: "Money",
      url: "/dashboard",
      icon: Wallet,
      items: [
        {
          title: "Cash flow",
          url: "/dashboard",
        },
        {
          title: "Reports",
          url: "/reports",
        },
        {
          title: "Goals",
          url: "/goals",
        },
      ],
    },
    {
      title: "AI Partner",
      url: "/chat",
      icon: Bot,
      items: [
        {
          title: "AI Chat",
          url: "/chat",
        },
        {
          title: "Insights",
          url: "/insights",
        },
        {
          title: "Learn",
          url: "/learn",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Business profile",
          url: "/settings",
        },
        {
          title: "Preferences",
          url: "/settings",
        },
        {
          title: "Notifications",
          url: "/settings",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Sales tracker",
      url: "/transactions",
      icon: Repeat2,
    },
    {
      name: "Expense categories",
      url: "/reports",
      icon: PieChart,
    },
    {
      name: "Learning plan",
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
