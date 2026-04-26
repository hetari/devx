<script setup lang="ts">
import { Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Reports",
});
</script>

<template>
  <div>
    <AppHeader
      title="Reports"
      subtitle="Export clean summaries for your business decisions."
    >
      <Button>
        <Download class="size-4" />
        Export Report
      </Button>
    </AppHeader>

    <section class="grid gap-4 xl:grid-cols-3">
      <CashFlowCard class="xl:col-span-2" />
      <article class="rounded-md border bg-card p-5">
        <h2 class="text-xl font-semibold tracking-normal">Business Summary</h2>
        <dl class="mt-5 grid gap-4 text-sm">
          <div class="flex justify-between gap-4 border-b pb-3">
            <dt class="text-muted-foreground">Total Transactions</dt>
            <dd class="font-semibold">24</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-3">
            <dt class="text-muted-foreground">Avg. Daily Profit</dt>
            <dd class="font-semibold">$29.67</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-3">
            <dt class="text-muted-foreground">Best Day</dt>
            <dd class="font-semibold text-chart-4">May 15 +$120</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Worst Day</dt>
            <dd class="font-semibold text-destructive">May 10 -$45</dd>
          </div>
        </dl>
      </article>
    </section>
  </div>
</template>
