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
      title="FINANCIAL REPORTS"
      subtitle="Generate comprehensive summaries for strategic review."
    >
      <Button class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">
        <Download class="size-4" />
        EXPORT REPORT
      </Button>
    </AppHeader>

    <section class="grid gap-4 xl:grid-cols-3">
      <CashFlowCard class="xl:col-span-2 landing-reveal" :style="{ animationDelay: '0ms' }"/>
      <article class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '100ms' }">
        <h2 class="text-xl font-black uppercase tracking-tight">OPERATIONAL SUMMARY</h2>
        <dl class="mt-5 grid gap-4 text-sm">
          <div class="flex justify-between gap-4 border-b border-muted/50 pb-3">
            <dt class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">TOTAL TRANSACTIONS</dt>
            <dd class="font-black tabular-nums">24</dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-muted/50 pb-3">
            <dt class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">AVG. DAILY PROFIT</dt>
            <dd class="font-black tabular-nums">$29.67</dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-muted/50 pb-3">
            <dt class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">BEST DAY</dt>
            <dd class="font-black tabular-nums text-chart-4">MAY 15 +$120</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">WORST DAY</dt>
            <dd class="font-black tabular-nums text-destructive">MAY 10 -$45</dd>
          </div>
        </dl>
      </article>
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
