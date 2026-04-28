<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TransactionRow from "./TransactionRow.vue";
import { transactions as mockTransactions } from "@/utils/businessData";
import { TrendingUp, ShoppingCart, Truck, Package, ReceiptText } from "lucide-vue-next";

const { transactions: aiTransactions } = useAIAssistantState();

const props = withDefaults(
  defineProps<{
    title?: string;
    limit?: number;
  }>(),
  {
    title: "Recent Transactions",
    limit: 5,
  },
);

const mappedAiTransactions = computed(() => {
  return aiTransactions.value.map((t) => {
    let icon = ReceiptText;
    if (t.category.toLowerCase().includes('material')) icon = Package;
    else if (t.category.toLowerCase().includes('deliver')) icon = Truck;
    else if (t.type === 'expense') icon = ShoppingCart;
    else icon = TrendingUp;

    return {
      title: t.type === 'revenue' 
        ? `Sold ${t.quantity || 1} items` 
        : `Bought ${t.category}`,
      time: t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doc: `AI-${t.id.substring(0,4).toUpperCase()}`,
      type: t.type === 'revenue' ? 'Revenue' : 'Expense',
      amount: t.type === 'revenue' ? t.amount : -t.amount,
      icon,
      tone: t.type === 'revenue' ? 'success' : 'danger'
    } as const;
  });
});

const visibleTransactions = computed(() => {
  const all = [...mappedAiTransactions.value, ...mockTransactions];
  return all.slice(0, props.limit);
});
</script>

<template>
  <Card class="gap-2 rounded-md py-5">
    <CardHeader class="px-5">
      <CardTitle class="text-xl font-black uppercase tracking-tight">
        {{ title }}
      </CardTitle>
      <CardAction>
      <Button as-child variant="ghost" size="sm" class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider">
        <NuxtLink to="/transactions"> View all </NuxtLink>
      </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="px-5">
      <TransactionRow
        v-for="transaction in visibleTransactions"
        :key="`${transaction.title}-${transaction.time}`"
        v-bind="transaction"
      />
    </CardContent>
  </Card>
</template>
