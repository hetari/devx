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

    <section class="mt-4 grid gap-4">
      <ReceiptCapture class="landing-reveal" :style="{ animationDelay: '200ms' }" />
      <NightShiftFeed class="landing-reveal" :style="{ animationDelay: '240ms' }" />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <CashFlowCard
          :chart-data="stats?.chartData"
          class="landing-reveal min-w-0"
          :style="{ animationDelay: '320ms' }"
        />

        <div class="grid gap-4">
          <GoalsCard class="landing-reveal" :style="{ animationDelay: '400ms' }" />
          <ExpenseCategories class="landing-reveal" :style="{ animationDelay: '480ms' }" />
          <AssistantCard class="landing-reveal" :style="{ animationDelay: '560ms' }" />
        </div>
      </div>

      <RecentTransactions class="landing-reveal" :style="{ animationDelay: '640ms' }" />
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
