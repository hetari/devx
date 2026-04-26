<script setup lang="ts">
import { Filter, Plus, Search } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Transactions",
});

const query = shallowRef("");
const activeFilter = shallowRef<"All" | "Revenue" | "Expense">("All");

const filteredTransactions = computed(() => {
  return transactions.filter((transaction) => {
    const matchesFilter =
      activeFilter.value === "All" || transaction.type === activeFilter.value;
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(query.value.toLowerCase());

    return matchesFilter && matchesSearch;
  });
});
</script>

<template>
  <div>
    <AppHeader
      title="Transactions"
      subtitle="View and manage all your business transactions."
    >
      <div class="relative min-w-64">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="query"
          class="pl-9"
          placeholder="Search transactions..."
        />
      </div>
      <Button variant="outline">
        <Filter class="size-4" />
        Filter
      </Button>
      <Button>
        <Plus class="size-4" />
        Add Transaction
      </Button>
    </AppHeader>

    <section class="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-md border bg-card p-5">
        <p class="text-sm text-muted-foreground">Net Cash Flow</p>
        <h2 class="mt-2 text-2xl font-semibold text-primary">+$1,258.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5">
        <p class="text-sm text-muted-foreground">Revenue</p>
        <h2 class="mt-2 text-2xl font-semibold text-chart-4">$2,450.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5">
        <p class="text-sm text-muted-foreground">Expenses</p>
        <h2 class="mt-2 text-2xl font-semibold text-destructive">$1,560.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5">
        <p class="text-sm text-muted-foreground">Transactions</p>
        <h2 class="mt-2 text-2xl font-semibold">24</h2>
      </article>
    </section>

    <section class="rounded-md border bg-card p-5">
      <div class="mb-4 flex flex-wrap gap-2">
        <Button
          v-for="filter in ['All', 'Revenue', 'Expense']"
          :key="filter"
          :variant="activeFilter === filter ? 'default' : 'outline'"
          size="sm"
          @click="activeFilter = filter as 'All' | 'Revenue' | 'Expense'"
        >
          {{ filter }}
          <Badge variant="secondary">{{
            filter === "All"
              ? transactions.length
              : transactions.filter((item) => item.type === filter).length
          }}</Badge>
        </Button>
      </div>
      <TransactionRow
        v-for="transaction in filteredTransactions"
        :key="`${transaction.title}-${transaction.time}`"
        v-bind="transaction"
      />
    </section>
  </div>
</template>
