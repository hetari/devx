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
        v-for="kpi in kpis"
        :key="kpi.title"
        v-bind="kpi"
      />
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-3">
      <CashFlowCard class="xl:col-span-2" />
      <GoalsCard />
      <ExpenseCategories />
      <AssistantCard />
      <RecentTransactions class="xl:col-span-2" title="Recent Activity" />
    </section>
  </div>
</template>
