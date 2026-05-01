<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
})

useSeoMeta({
  title: "لوحة التحكم",
})

import { TrendingUp, TrendingDown, Wallet, Percent } from "lucide-vue-next";

const iconMap: Record<string, any> = {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent
};

// Fetch real stats from backend
const { data: stats, refresh } = await useFetch('/api/dashboard/stats');

// Re-fetch when AI saves data
const { robotState } = useAIAssistantState();
watch(robotState, (newState) => {
  if (newState === 'saved') {
    refresh();
  }
});

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const kpis = computed(() => {
  if (!stats.value) return [];
  return stats.value.kpis.map((kpi: any) => ({
    ...kpi,
    value: typeof kpi.value === 'number' ? formatter.format(kpi.value) : kpi.value,
    icon: iconMap[kpi.icon] || Wallet
  }));
});
</script>

<template>
  <div>
    <AppHeader
      title="لوحة التحكم"
      subtitle="هكذا يبدو أداء عملك الآن."
    />

    <section v-if="kpis.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        v-for="(kpi, index) in kpis"
        :key="kpi.title"
        v-bind="kpi"
        class="landing-reveal"
        :style="{ animationDelay: `${index * 80}ms` }"
      />
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-3">
      <ReceiptCapture class="xl:col-span-3 landing-reveal" :style="{ animationDelay: '200ms' }" />
      <NightShiftFeed class="xl:col-span-3 landing-reveal" :style="{ animationDelay: '240ms' }" />
      <CashFlowCard :chart-data="stats?.chartData" class="xl:col-span-2 landing-reveal" :style="{ animationDelay: '320ms' }" />
      <GoalsCard class="landing-reveal" :style="{ animationDelay: '400ms' }" />
      <ExpenseCategories class="landing-reveal" :style="{ animationDelay: '480ms' }" />
      <AssistantCard class="landing-reveal" :style="{ animationDelay: '560ms' }" />
      <RecentTransactions class="xl:col-span-2 landing-reveal" :style="{ animationDelay: '640ms' }" />
    </section>
  </div>
</template>

<style scoped>
.landing-reveal {
  animation: landing-rise 520ms ease-out both;
}

@keyframes landing-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
