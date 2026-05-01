<script setup lang="ts">
import { BookOpen, Trophy, Zap } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "التعلم",
});
</script>

<template>
  <div>
    <AppHeader
      title="التعلم والتطوير"
      subtitle="طوّر خبرتك وادفع نمو العمل."
    />

    <section class="rounded-md border bg-card p-6 landing-reveal" :style="{ animationDelay: '0ms' }">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-md bg-muted p-4">
          <BookOpen class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl font-black tabular-nums">24</strong>
          <span class="text-sm font-black uppercase tracking-wider text-muted-foreground">الدروس المكتملة</span>
        </div>
        <div class="rounded-md bg-muted p-4">
          <Trophy class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl font-black tabular-nums">320</strong>
          <span class="text-sm font-black uppercase tracking-wider text-muted-foreground">النقاط المكتسبة</span>
        </div>
        <div class="rounded-md bg-muted p-4">
          <Zap class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl font-black tabular-nums">12</strong>
          <span class="text-sm font-black uppercase tracking-wider text-muted-foreground">سلسلة الأيام</span>
        </div>
      </div>
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-3">
      <article
        v-for="(lesson, index) in lessons"
        :key="lesson.title"
        class="rounded-md border bg-card p-5 landing-reveal"
        :style="{ animationDelay: `${100 + index * 80}ms` }"
      >
        <ToneIcon :icon="lesson.icon" tone="primary" />
        <h2 class="mt-5 text-xl font-black uppercase tracking-tight">
          {{ lesson.title }}
        </h2>
        <div class="mt-5 h-1.5 overflow-hidden rounded-sm bg-muted">
          <span
            class="block h-full rounded-sm bg-primary"
            :style="{ width: `${lesson.progress}%` }"
          />
        </div>
        <div class="mt-4 flex items-center justify-between gap-4">
          <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground"
            >{{ lesson.progress }}% مكتمل</span
          >
          <Button size="sm" class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider">متابعة</Button>
        </div>
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
