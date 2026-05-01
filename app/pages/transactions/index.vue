<script setup lang="ts">
import { Filter, Plus, Search } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "المعاملات",
});

const query = shallowRef("");
const activeFilter = shallowRef<"All" | "Revenue" | "Expense">("All");
const filters = [
  { label: "الكل", value: "All" },
  { label: "الإيرادات", value: "Revenue" },
  { label: "المصروفات", value: "Expense" },
] as const;

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
      title="سجل المعاملات"
      subtitle="سجل شامل لكل العمليات التجارية."
    >
      <div class="relative min-w-64">
        <Search
          class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="query"
          class="ps-9 h-9 rounded-md text-xs font-black uppercase tracking-wider focus-visible:ring-primary"
          placeholder="ابحث عن رقم المعاملة..."
        />
      </div>
      <Button variant="outline" class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">
        <Filter class="size-4" />
        تصفية السجل
      </Button>
      <Button class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">
        <Plus class="size-4" />
        إضافة سجل
      </Button>
    </AppHeader>

    <section class="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '0ms' }">
        <p class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">صافي التدفق النقدي</p>
        <h2 class="mt-2 text-2xl font-black tabular-nums text-primary">+$1,258.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '80ms' }">
        <p class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">الإيرادات</p>
        <h2 class="mt-2 text-2xl font-black tabular-nums text-chart-4">$2,450.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '160ms' }">
        <p class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">المصروفات</p>
        <h2 class="mt-2 text-2xl font-black tabular-nums text-destructive">$1,560.00</h2>
      </article>
      <article class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '240ms' }">
        <p class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">إجمالي المعاملات</p>
        <h2 class="mt-2 text-2xl font-black tabular-nums">24</h2>
      </article>
    </section>

    <section class="rounded-md border bg-card p-5 landing-reveal" :style="{ animationDelay: '320ms' }">
      <div class="mb-4 flex flex-wrap gap-2">
        <Button
          v-for="filter in filters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'default' : 'outline'"
          size="sm"
          class="h-8 rounded-md text-[10px] font-black uppercase tracking-wider"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <Badge variant="secondary" class="rounded-md text-[10px] font-black uppercase tracking-wider">{{
            filter.value === "All"
              ? transactions.length
              : transactions.filter((item) => item.type === filter.value).length
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

<style scoped>
.landing-reveal {
  animation: landing-rise 520ms ease-out both;
}

@keyframes landing-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
