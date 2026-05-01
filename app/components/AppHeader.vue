<script setup lang="ts">
import { Bell, Sparkles } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: "مساء الخير يا طارق",
    subtitle: "لننمِّ عملك معاً",
  },
);
</script>

<template>
  <header
    class="mb-6 flex shrink-0 flex-col gap-4 border-b bg-background/95 pb-5 pt-1"
  >
    <div
      class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div class="flex min-w-0 items-center gap-3">
        <SidebarTrigger
          class="mt-1 size-9 shrink-0 border bg-background shadow-xs"
          aria-label="تبديل الشريط الجانبي"
        />
        <Separator
          orientation="vertical"
          class="hidden data-[orientation=vertical]:h-6 sm:block"
        />

        <div class="min-w-0">
          <h1
            class="truncate text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl"
          >
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="mt-1 max-w-2xl text-sm font-medium leading-6 text-muted-foreground"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
        <slot />
        <ToggleMode />
        <Button
          variant="outline"
          size="icon"
          class="relative size-9 rounded-md bg-background"
        aria-label="الإشعارات"
        >
          <Bell class="size-4" />
          <span
            class="absolute end-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background"
          />
        </Button>
        <Avatar class="size-9 rounded-md border">
          <AvatarFallback
            class="rounded-md bg-primary text-primary-foreground font-black text-xs"
          >
            T
          </AvatarFallback>
        </Avatar>
      </div>
    </div>

    <div class="grid gap-2 sm:grid-cols-3">
      <Card class="min-h-12 border-primary/20 rounded-md py-0 shadow-none">
        <CardContent class="flex h-full items-center justify-between px-3 py-2">
        <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">الربح الشهري</span>
        <span
          class="text-sm font-black text-chart-4"
        >
          +24.1%
        </span>
        </CardContent>
      </Card>
      <Card class="min-h-12 border-primary/20 rounded-md py-0 shadow-none">
        <CardContent class="flex h-full items-center justify-between px-3 py-2">
        <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">المدة النقدية</span>
        <span class="text-sm font-black text-foreground">8.5 شهر</span>
        </CardContent>
      </Card>
      <Card class="min-h-12 bg-primary text-primary-foreground rounded-md py-0 shadow-none">
        <CardContent class="flex h-full items-center justify-between px-3 py-2">
        <span
          class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground/80"
        >
          <Sparkles class="size-3 text-primary-foreground" />
          موجز الذكاء
        </span>
        <span class="text-sm font-black uppercase">جاهز</span>
        </CardContent>
      </Card>
    </div>
  </header>
</template>
