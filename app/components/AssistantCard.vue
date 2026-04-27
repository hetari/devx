<script setup lang="ts">
import {
  ArrowRight,
  BarChart3,
  Bot,
  HelpCircle,
  Lightbulb,
  Sparkles,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
</script>

<template>
  <Card class="gap-5 rounded-md p-5 border-primary/20">
    <Badge variant="primary" class="gap-1.5 rounded-md bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-wider">
      <Sparkles class="size-3" />
      AI Partner
    </Badge>
    <div class="mt-5 flex items-start gap-4">
      <ToneIcon :icon="Bot" tone="primary" class="size-14" />
      <div>
        <h2 class="text-xl font-black uppercase tracking-tight">
          System Pulse: Healthy
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          Profit is trending <span class="text-chart-4 font-black">+24.1%</span>. Check expense pressure.
        </p>
      </div>
    </div>
    <div class="mt-6 grid gap-2">
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><BarChart3 class="size-4" /> Analyse Revenue Flow</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><HelpCircle class="size-4" /> Query Profit Delta</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/learn">
          <span class="inline-flex items-center gap-2"
            ><Lightbulb class="size-4" /> Growth Protcols</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
    </div>
  </Card>
</template>
