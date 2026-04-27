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
      <CardTitle class="text-xl font-black uppercase tracking-tight">Goals Progress</CardTitle>
      <CardAction>
      <Button as-child variant="ghost" size="sm" class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider">
        <NuxtLink to="/goals">View all</NuxtLink>
      </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="grid gap-6 px-5">
      <div
        v-for="goal in goals"
        :key="goal.title"
        class="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3"
      >
        <ToneIcon :icon="goal.icon" :tone="goal.tone" />
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider">
            {{ goal.title }}
          </h3>
          <p class="mt-0.5 text-[10px] font-medium text-muted-foreground uppercase">
            {{ goal.value }}
          </p>
          <div class="mt-2 h-1.5 overflow-hidden rounded-sm bg-muted">
            <span
              class="block h-full rounded-sm bg-primary"
              :style="{ width: `${goal.progress}%` }"
            />
          </div>
        </div>
        <strong class="text-sm font-black">{{ goal.progress }}%</strong>
      </div>
    </CardContent>
  </Card>
</template>
