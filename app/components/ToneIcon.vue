<script setup lang="ts">
import type { Component } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  icon: Component
  tone?: "success" | "danger" | "info" | "primary" | "warning" | "muted"
  class?: string
}>()

const toneClass = computed(() => {
  const tones = {
    success: "bg-chart-4/15 text-chart-4",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-chart-5/15 text-chart-5",
    primary: "bg-primary/15 text-primary",
    warning: "bg-chart-3/20 text-chart-3",
    muted: "bg-muted text-muted-foreground",
  }

  return tones[props.tone ?? "primary"]
})
</script>

<template>
  <span :class="cn('grid size-11 shrink-0 place-items-center rounded-md', toneClass, props.class)">
    <component :is="icon" class="size-5" />
  </span>
</template>
