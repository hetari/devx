<script setup lang="ts">
import { kpis as mockKpis } from "@/utils/businessData";

definePageMeta({
  layout: "authenticated",
})

useSeoMeta({
  title: "Dashboard",
})

const { transactions: aiTransactions } = useAIAssistantState();

const kpis = computed(() => {
  if (aiTransactions.value.length === 0) return mockKpis;
  
  // Calculate today's additional revenue/expenses from AI
  let todayRev = 0;
  let todayExp = 0;
  aiTransactions.value.forEach(t => {
    if (t.type === 'revenue') todayRev += t.amount;
    else if (t.type === 'expense') todayExp += t.amount;
  });
  
  // Extract base values from mockKpis
  const baseRevStr = mockKpis[0].value.replace(/[^0-9.-]+/g,"");
  const baseExpStr = mockKpis[1].value.replace(/[^0-9.-]+/g,"");
  
  const baseRev = parseFloat(baseRevStr);
  const baseExp = parseFloat(baseExpStr);
  
  const newRev = baseRev + todayRev;
  const newExp = baseExp + todayExp;
  const newProfit = newRev - newExp;
  const newMargin = newRev > 0 ? (newProfit / newRev) * 100 : 0;
  
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  
  const updatedKpis = [...mockKpis];
  updatedKpis[0] = { ...updatedKpis[0], value: formatter.format(newRev) };
  updatedKpis[1] = { ...updatedKpis[1], value: formatter.format(newExp) };
  updatedKpis[2] = { ...updatedKpis[2], value: formatter.format(newProfit) };
  updatedKpis[3] = { ...updatedKpis[3], value: `${newMargin.toFixed(1)}%` };
  
  return updatedKpis;
});
</script>

<template>
  <div>
    <AppHeader
      title="Dashboard"
      subtitle="Here's how your business is performing."
    />

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        v-for="(kpi, index) in kpis"
        :key="kpi.title"
        v-bind="kpi"
        class="landing-reveal"
        :style="{ animationDelay: `${index * 80}ms` }"
      />
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-3">
      <CashFlowCard class="xl:col-span-2 landing-reveal" :style="{ animationDelay: '320ms' }" />
      <GoalsCard class="landing-reveal" :style="{ animationDelay: '400ms' }" />
      <ExpenseCategories class="landing-reveal" :style="{ animationDelay: '480ms' }" />
      <AssistantCard class="landing-reveal" :style="{ animationDelay: '560ms' }" />
      <RecentTransactions class="xl:col-span-2 title='Recent Activity' landing-reveal" :style="{ animationDelay: '640ms' }" />
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
