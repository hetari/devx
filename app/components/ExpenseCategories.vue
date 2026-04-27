<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
</script>

<template>
  <Card class="gap-5 rounded-md py-5">
    <CardHeader class="px-5">
      <CardTitle class="text-xl font-black uppercase tracking-tight">
        Expense Pressure
      </CardTitle>
      <CardAction>
      <Button variant="ghost" size="sm" class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider"> View all </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="grid gap-6 px-5">
      <div
        v-for="category in categories"
        :key="category.name"
        class="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3"
      >
        <ToneIcon :icon="category.icon" :tone="category.tone" class="size-9" />
        <div>
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-black uppercase tracking-wider">
              {{ category.name }}
            </h3>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-sm bg-muted">
            <span
              class="block h-full rounded-sm bg-primary"
              :style="{ width: `${category.percent}%` }"
            />
          </div>
        </div>
        <p class="text-right text-[10px] font-black uppercase tabular-nums">
          <span class="text-muted-foreground">{{ moneyFormatter.format(category.value) }}</span><br>
          <span class="text-destructive">{{ category.percent }}%</span>
        </p>
      </div>
    </CardContent>
  </Card>
</template>
