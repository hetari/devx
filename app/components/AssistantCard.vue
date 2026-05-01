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

const { insights } = useAIAssistantState();

const latestInsight = computed(() => {
  if (insights.value.length > 0) {
    return insights.value[0];
  }
  return {
    what_happened: "يتجه الربح إلى +24.1%.",
    what_to_do: "تحقق من ضغط المصروفات."
  };
});
</script>

<template>
  <Card class="gap-5 rounded-md p-5 border-primary/20">
    <Badge variant="primary" class="gap-1.5 rounded-md bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-wider">
      <Sparkles class="size-3" />
      الشريك الذكي
    </Badge>
    <div class="mt-5 flex items-start gap-4">
      <ToneIcon :icon="Bot" tone="primary" class="size-14" />
      <div>
        <h2 class="text-xl font-black uppercase tracking-tight">
          نبض النظام: {{ insights.length > 0 ? 'قابل للتنفيذ' : 'سليم' }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          <span class="text-chart-4 font-black">{{ latestInsight.what_happened }}</span>
          {{ latestInsight.what_to_do }}
        </p>
      </div>
    </div>
    <div class="mt-6 grid gap-2">
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><BarChart3 class="size-4" /> تحليل تدفق الإيرادات</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/chat">
          <span class="inline-flex items-center gap-2"
            ><HelpCircle class="size-4" /> استفسر عن فرق الربح</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
      <Button as-child variant="outline" class="justify-between h-10 rounded-md text-xs font-black uppercase tracking-wider">
        <NuxtLink to="/learn">
          <span class="inline-flex items-center gap-2"
            ><Lightbulb class="size-4" /> بروتوكولات النمو</span
          >
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
    </div>
  </Card>
</template>
