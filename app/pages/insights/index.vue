<script setup lang="ts">
import {
  ArrowRight,
  TriangleAlert,
  TrendingUp,
  Lightbulb,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "الرؤى",
});

const { data: insights, refresh } = await useFetch("/api/insights");

// Re-fetch when AI saves data
const { robotState } = useAIAssistantState();
watch(robotState, (newState) => {
  if (newState === "saved") {
    refresh();
  }
});
</script>

<template>
  <div>
    <AppHeader title="رؤى الأداء" subtitle="معلومات عملية للنمو الاستراتيجي." />

    <section class="grid gap-4">
      <article
        v-for="(insight, index) in insights"
        :key="insight.id"
        class="rounded-md border bg-card p-6 landing-reveal"
        :class="{
          'border-destructive/30':
            index === 0 && insight.category === 'Cash Flow',
        }"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="flex flex-col gap-5 md:flex-row">
          <ToneIcon
            :icon="insight.category === 'Cash Flow' ? TriangleAlert : Lightbulb"
            :tone="insight.category === 'Cash Flow' ? 'danger' : 'success'"
            class="size-16 rounded-full"
          />
          <div class="flex-1">
            <Badge
              v-if="insight.category"
              variant="outline"
              class="rounded-md text-[10px] font-black uppercase tracking-wider mb-2"
            >
              {{ insight.category }}
            </Badge>
            <h2 class="text-2xl font-black uppercase tracking-tight">
              {{ insight.whatHappened }}
            </h2>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1"
                >
                  لماذا هذا مهم
                </h4>
                <p class="text-sm font-medium">{{ insight.whyItMatters }}</p>
              </div>
              <div v-if="insight.whatToDo">
                <h4
                  class="text-[10px] font-black uppercase tracking-widest text-primary mb-1"
                >
                  ما الذي يجب فعله
                </h4>
                <p class="text-sm font-medium">{{ insight.whatToDo }}</p>
              </div>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <Button
                as-child
                class="h-10 rounded-md text-[10px] font-black uppercase tracking-wider"
              >
                <NuxtLink to="/chat">ناقش مع شريكك</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <div
        v-if="!insights || insights.length === 0"
        class="py-20 text-center text-muted-foreground italic uppercase tracking-widest text-xs"
      >
        لم يتم توليد رؤى استراتيجية بعد. تحدّث مع شريكك الذكي لتحليل عملك.
      </div>
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-2">
      <ExpenseCategories
        class="landing-reveal"
        :style="{ animationDelay: '200ms' }"
      />
      <AssistantCard
        class="landing-reveal"
        :style="{ animationDelay: '300ms' }"
      />
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
