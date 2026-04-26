<script setup lang="ts">
import { BookOpen, Trophy, Zap } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Learn",
});
</script>

<template>
  <div>
    <AppHeader
      title="Learn"
      subtitle="Grow your knowledge. Grow your business."
    />

    <section class="rounded-md border bg-card p-6">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-md bg-muted p-4">
          <BookOpen class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl">24</strong>
          <span class="text-sm text-muted-foreground">Lessons Completed</span>
        </div>
        <div class="rounded-md bg-muted p-4">
          <Trophy class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl">320</strong>
          <span class="text-sm text-muted-foreground">Points Earned</span>
        </div>
        <div class="rounded-md bg-muted p-4">
          <Zap class="size-5 text-primary" />
          <strong class="mt-3 block text-2xl">12</strong>
          <span class="text-sm text-muted-foreground">Day Streak</span>
        </div>
      </div>
    </section>

    <section class="mt-4 grid gap-4 xl:grid-cols-3">
      <article
        v-for="lesson in lessons"
        :key="lesson.title"
        class="rounded-md border bg-card p-5"
      >
        <ToneIcon :icon="lesson.icon" tone="primary" />
        <h2 class="mt-5 text-xl font-semibold tracking-normal">
          {{ lesson.title }}
        </h2>
        <div class="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <span
            class="block h-full rounded-full bg-primary"
            :style="{ width: `${lesson.progress}%` }"
          />
        </div>
        <div class="mt-4 flex items-center justify-between gap-4">
          <span class="text-sm text-muted-foreground"
            >{{ lesson.progress }}% complete</span
          >
          <Button size="sm">Continue</Button>
        </div>
      </article>
    </section>
  </div>
</template>
