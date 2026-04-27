<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
})

useSeoMeta({
  title: "Dashboard",
})
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
