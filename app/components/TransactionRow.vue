<script setup lang="ts">
import type { Component } from "vue";
import { ChevronRight } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  title: string;
  time: string;
  doc: string;
  type: "Revenue" | "Expense";
  amount: number;
  icon: Component;
  tone: "success" | "danger" | "primary";
}>();

const formattedAmount = computed(() => {
  const sign = props.amount >= 0 ? "+" : "-";
  return `${sign}${moneyFormatter.format(Math.abs(props.amount))}`;
});
</script>

<template>
  <div
    class="grid min-h-16 grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0 md:grid-cols-[2.75rem_1fr_6rem_8rem_1.25rem]"
  >
    <ToneIcon :icon="icon" :tone="tone" />
    <div class="min-w-0">
      <h3 class="truncate text-sm font-medium">
        {{ title }}
      </h3>
      <p class="truncate text-xs text-muted-foreground">
        {{ time }} <span class="px-1">·</span> {{ doc }}
      </p>
    </div>
    <Badge
      class="hidden justify-self-center md:inline-flex"
      :variant="type === 'Revenue' ? 'secondary' : 'outline'"
    >
      {{ type }}
    </Badge>
    <strong
      class="justify-self-end text-sm font-semibold"
      :class="amount >= 0 ? 'text-chart-4' : 'text-destructive'"
    >
      {{ formattedAmount }}
    </strong>
    <ChevronRight class="hidden size-4 text-muted-foreground md:block" />
  </div>
</template>
