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
      title="Insights"
      subtitle="AI-powered insights to help you grow your business."
    />

    <section class="grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
      <article class="rounded-md border border-destructive/30 bg-card p-6">
        <div class="flex flex-col gap-5 md:flex-row">
          <ToneIcon
            :icon="TriangleAlert"
            tone="danger"
            class="size-16 rounded-full"
          />
          <div class="flex-1">
            <Badge variant="destructive">Warning</Badge>
            <h2 class="mt-3 text-3xl font-semibold tracking-normal">
              Your expenses are <span class="text-destructive">63%</span> of
              your revenue
            </h2>
            <p class="mt-3 leading-7 text-muted-foreground">
              This is higher than the optimal range and may reduce your profit
              margin.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <Button as-child>
                <NuxtLink to="/chat">Ask AI for Advice</NuxtLink>
              </Button>
              <Button variant="outline">
                See Details
                <ArrowRight class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-md border bg-card p-6">
        <ToneIcon :icon="TrendingUp" tone="success" />
        <h2 class="mt-5 text-2xl font-semibold tracking-normal">
          Profit is improving
        </h2>
        <p class="mt-3 leading-7 text-muted-foreground">
          Your profit increased by 24.1% compared to last month.
        </p>
      </article>
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-2">
      <ExpenseCategories />
      <AssistantCard />
    </section>
  </div>
</template>
