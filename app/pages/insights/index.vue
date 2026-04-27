<script setup lang="ts">
import { ArrowRight, TriangleAlert, TrendingUp } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Insights",
});
</script>

<template>
  <div>
    <AppHeader
      title="PERFORMANCE INSIGHTS"
      subtitle="Actionable intelligence for strategic growth."
    />

    <section class="grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
      <article class="rounded-md border border-destructive/30 bg-card p-6 landing-reveal" :style="{ animationDelay: '0ms' }">
        <div class="flex flex-col gap-5 md:flex-row">
          <ToneIcon
            :icon="TriangleAlert"
            tone="danger"
            class="size-16 rounded-full"
          />
          <div class="flex-1">
            <Badge variant="destructive" class="rounded-md text-[10px] font-black uppercase tracking-wider">CRITICAL WARNING</Badge>
            <h2 class="mt-3 text-3xl font-black uppercase tracking-tight">
              EXPENSES AT <span class="text-destructive">63%</span> OF REVENUE
            </h2>
            <p class="mt-3 leading-relaxed text-sm font-medium text-muted-foreground">
              This metric exceeds the optimal operational range, signaling potential erosion of profit margins.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <Button as-child class="h-10 rounded-md text-[10px] font-black uppercase tracking-wider">
                <NuxtLink to="/chat">ASK AI FOR ADVICE</NuxtLink>
              </Button>
              <Button variant="outline" class="h-10 rounded-md text-[10px] font-black uppercase tracking-wider">
                SEE DETAILS
                <ArrowRight class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-md border bg-card p-6 landing-reveal" :style="{ animationDelay: '100ms' }">
        <ToneIcon :icon="TrendingUp" tone="success" />
        <h2 class="mt-5 text-2xl font-black uppercase tracking-tight">
          PROFIT MARGIN: OPTIMAL
        </h2>
        <p class="mt-3 leading-relaxed text-sm font-medium text-muted-foreground">
          Your profit increased by <strong class="font-black text-chart-4">24.1%</strong> compared to last month.
        </p>
      </article>
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-2">
      <ExpenseCategories class="landing-reveal" :style="{ animationDelay: '200ms' }"/>
      <AssistantCard class="landing-reveal" :style="{ animationDelay: '300ms' }"/>
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
