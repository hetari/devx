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
  <Card class="gap-5 rounded-md p-5">
    <Badge variant="secondary" class="gap-1.5">
      <Sparkles class="size-3.5" />
      AI Co-Founder
    </Badge>
    <div class="mt-5 flex items-start gap-4">
      <ToneIcon :icon="Bot" tone="primary" class="size-14" />
      <div>
        <h2 class="text-xl font-semibold tracking-normal">
          Your business is doing well today.
        </h2>
        <p class="mt-2 leading-7 text-muted-foreground">
          Profit is up, but expenses are still high compared to revenue.
        </p>
      </div>
    </div>
    <div class="mt-5 grid gap-2">
      <Button as-child variant="outline" class="justify-between">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><BarChart3 class="size-4" /> How is my business?</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><HelpCircle class="size-4" /> Why is my profit low?</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between">
        <NuxtLink to="/learn">
          <span class="inline-flex items-center gap-2"
            ><Lightbulb class="size-4" /> Tips to grow</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
    </div>
  </Card>
</template>
