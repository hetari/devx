<script setup lang="ts">
import type { Component } from "vue"
import type { ChartConfig } from "@/components/ui/chart"
import { VisLine, VisXYContainer } from "@unovis/vue"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

defineProps<{
  title: string
  value: string
  change: string
  icon: Component
  tone: "success" | "danger" | "info" | "primary"
}>()

const sparklineData = [
  { index: 0, value: 45 },
  { index: 1, value: 43 },
  { index: 2, value: 35 },
  { index: 3, value: 44 },
  { index: 4, value: 50 },
  { index: 5, value: 39 },
  { index: 6, value: 22 },
  { index: 7, value: 34 },
  { index: 8, value: 44 },
  { index: 9, value: 31 },
  { index: 10, value: 16 },
  { index: 11, value: 28 },
  { index: 12, value: 38 },
  { index: 13, value: 28 },
]

type SparklinePoint = (typeof sparklineData)[number]

const sparklineConfig = {
  value: {
    label: "Trend",
    color: "var(--primary)",
  },
} satisfies ChartConfig
</script>

<template>
  <Card class="gap-0 overflow-hidden rounded-md p-0">
    <CardContent class="p-5">
      <div class="flex items-start justify-between gap-4">
        <ToneIcon :icon="icon" :tone="tone" />
        <span
          class="rounded-md bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
        >
          +{{ change }}
        </span>
      </div>
      <p class="mt-5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {{ title }}
      </p>
      <h2 class="mt-1 text-3xl font-black tracking-tight">
        {{ value }}
      </h2>
      <p class="mt-1 text-[10px] font-medium text-muted-foreground">
        VS APR 1 - APR 30
      </p>
      <ChartContainer :config="sparklineConfig" class="mt-5 h-10">
        <VisXYContainer
          :data="sparklineData"
          :padding="{ top: 4, bottom: 4, left: 0, right: 0 }"
        >
          <VisLine
            :x="(d: SparklinePoint) => d.index"
            :y="(d: SparklinePoint) => d.value"
            :color="sparklineConfig.value.color"
            :line-width="4"
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
