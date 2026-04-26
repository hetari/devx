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
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";

type CashPoint = (typeof cashData)[number];

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
      <CardTitle class="text-xl tracking-normal">
        Cash Flow Overview
      </CardTitle>
      <CardDescription>
        Revenue, expenses, and profit across May.
      </CardDescription>
      <CardAction>
        <Button variant="outline" size="sm"> This Month </Button>
      </CardAction>
    </CardHeader>

    <CardContent class="px-5">
      <div class="mb-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-full bg-chart-4" />
          Revenue
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-full bg-destructive" />
          Expenses
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-full bg-primary" />
          Profit
        </span>
      </div>

      <ChartContainer :config="cashFlowConfig" class="h-72 w-full" cursor>
        <VisXYContainer
          :data="cashData"
          :padding="{ top: 12, bottom: 28, left: 36, right: 12 }"
        >
          <VisAxis
            type="x"
            :tick-format="(value: string) => value.replace('May ', '')"
          />
          <VisAxis type="y" />
          <VisGroupedBar
            :x="(d: CashPoint) => d.day"
            :y="[
              (d: CashPoint) => d.revenue,
              (d: CashPoint) => d.expenses,
              (d: CashPoint) => Math.max(d.profit, 0),
            ]"
            :color="cashFlowColors"
            :rounded-corners="4"
          />
          <ChartCrosshair
            :color="cashFlowColors"
            :template="componentToString(cashFlowConfig, ChartTooltipContent)"
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
