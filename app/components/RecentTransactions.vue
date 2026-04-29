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
import { TrendingUp, ShoppingCart, Truck, Package, ReceiptText } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    title?: string;
    limit?: number;
  }>(),
  {
    title: "Recent Activity",
    limit: 10,
  },
);

// Fetch real transactions
const { data: dbTransactions, refresh } = await useFetch('/api/transactions', {
  query: { limit: props.limit }
});

// Re-fetch when AI saves data
const { robotState } = useAIAssistantState();
watch(robotState, (newState) => {
  if (newState === 'saved') {
    refresh();
  }
});

const mappedTransactions = computed(() => {
  if (!dbTransactions.value) return [];
  
  return dbTransactions.value.map((t: any) => {
    let icon = ReceiptText;
    const cat = t.category.toLowerCase();
    if (cat.includes('material')) icon = Package;
    else if (cat.includes('deliver')) icon = Truck;
    else if (t.type === 'expense') icon = ShoppingCart;
    else icon = TrendingUp;

    return {
      ...t,
      title: t.title || (t.type === 'revenue' ? 'Sales Revenue' : 'Business Expense'),
      time: t.time || new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doc: t.doc || `TX-${t.id.substring(0,4).toUpperCase()}`,
      type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      amount: t.type === 'revenue' ? t.amount : -t.amount,
      icon,
      tone: t.type === 'revenue' ? 'success' : 'danger'
    } as const;
  });
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
        v-for="transaction in mappedTransactions"
        :key="transaction.id"
        v-bind="transaction"
      />
      <div v-if="mappedTransactions.length === 0" class="py-10 text-center text-muted-foreground text-xs italic">
        No recent activity found.
      </div>
    </CardContent>
  </Card>
</template>
