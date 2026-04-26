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
      <CardTitle class="text-xl tracking-normal">Goals Progress</CardTitle>
      <CardAction>
      <Button as-child variant="ghost" size="sm">
        <NuxtLink to="/goals">View all</NuxtLink>
      </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="grid gap-5 px-5">
      <div
        v-for="goal in goals"
        :key="goal.title"
        class="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3"
      >
        <ToneIcon :icon="goal.icon" :tone="goal.tone" />
        <div>
          <h3 class="text-sm font-medium">
            {{ goal.title }}
          </h3>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ goal.value }}
          </p>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <span
              class="block h-full rounded-full bg-primary"
              :style="{ width: `${goal.progress}%` }"
            />
          </div>
        </div>
        <strong class="text-sm">{{ goal.progress }}%</strong>
      </div>
    </CardContent>
  </Card>
</template>
