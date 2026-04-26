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

const visibleTransactions = computed(() => transactions.slice(0, props.limit));
</script>

<template>
  <Card class="gap-2 rounded-md py-5">
    <CardHeader class="px-5">
      <CardTitle class="text-xl tracking-normal">
        {{ title }}
      </CardTitle>
      <CardAction>
      <Button as-child variant="ghost" size="sm">
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
