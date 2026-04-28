<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart";
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";
import { cashData } from "@/utils/businessData";

const { transactions: aiTransactions } = useAIAssistantState();

const cashChartData = computed(() => {
  const baseData = cashData.map((point) => ({
    ...point,
    date: new Date(2026, 4, Number(point.day.replace("May ", ""))),
  }));
  
  if (aiTransactions.value.length === 0) return baseData;
  
  // Calculate today's additional revenue/expenses from AI
  let todayRev = 0;
  let todayExp = 0;
  aiTransactions.value.forEach(t => {
    if (t.type === 'revenue') todayRev += t.amount;
    else if (t.type === 'expense') todayExp += t.amount;
  });
  
  // Assuming today is May 31 for the demo data
  const lastPoint = baseData[baseData.length - 1];
  lastPoint.revenue += todayRev;
  lastPoint.expenses += todayExp;
  lastPoint.profit = lastPoint.revenue - lastPoint.expenses;
  
  return baseData;
});

type CashPoint = (typeof cashChartData.value)[number];

const cashFlowConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-4)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--destructive)",
  },
  profit: {
    label: "Profit",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const cashFlowColors = [
  cashFlowConfig.revenue.color,
  cashFlowConfig.expenses.color,
  cashFlowConfig.profit.color,
];
</script>

<template>
  <Card class="gap-5 rounded-md py-5">
    <CardHeader class="px-5">
      <CardTitle class="text-xl font-black uppercase tracking-tight">
        Cash Flow Overview
      </CardTitle>
      <CardDescription class="text-xs font-medium">
        Revenue, expenses, and profit across May.
      </CardDescription>
      <CardAction>
        <Button variant="outline" size="sm" class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider"> This Month </Button>
      </CardAction>
    </CardHeader>

    <CardContent class="px-5">
      <div class="mb-5 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-sm bg-chart-4" />
          Revenue
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-sm bg-destructive" />
          Expenses
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-sm bg-primary" />
          Profit
        </span>
      </div>

      <ChartContainer :config="cashFlowConfig" class="h-72 w-full" cursor>
        <VisXYContainer
          :data="cashChartData"
          :padding="{ top: 12, bottom: 28, left: 36, right: 12 }"
        >
          <VisAxis
            type="x"
            :x="(d: CashPoint) => d.date"
            :tick-values="cashChartData.map((d) => d.date)"
            :tick-format="
              (value: number) =>
                new Date(value).toLocaleDateString('en-US', { day: 'numeric' })
            "
          />
          <VisAxis type="y" />
          <VisGroupedBar
            :x="(d: CashPoint) => d.date"
            :y="[
              (d: CashPoint) => d.revenue,
              (d: CashPoint) => d.expenses,
              (d: CashPoint) => Math.max(d.profit, 0),
            ]"
            :color="cashFlowColors"
            :rounded-corners="4"
          />
          <ChartTooltip />
          <ChartCrosshair
            :color="cashFlowColors"
            :template="
              componentToString(cashFlowConfig, ChartTooltipContent, {
                labelFormatter(value) {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                },
              })
            "
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
