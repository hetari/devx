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
      <CardTitle class="text-xl tracking-normal">
        Top Expense Categories
      </CardTitle>
      <CardAction>
      <Button variant="ghost" size="sm"> View all </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="grid gap-4 px-5">
      <div
        v-for="category in categories"
        :key="category.name"
        class="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3"
      >
        <ToneIcon :icon="category.icon" :tone="category.tone" class="size-9" />
        <div>
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-sm font-medium">
              {{ category.name }}
            </h3>
          </div>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <span
              class="block h-full rounded-full bg-primary"
              :style="{ width: `${category.percent}%` }"
            />
          </div>
        </div>
        <p class="text-right text-xs text-muted-foreground">
          {{ moneyFormatter.format(category.value) }}<br>
          {{ category.percent }}%
        </p>
      </div>
    </CardContent>
  </Card>
</template>
