<script setup lang="ts">
import { Bell, Sparkles } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: "Good evening, Tariq",
    subtitle: "Let's grow your business together",
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
          aria-label="Toggle sidebar"
        />
        <Separator
          orientation="vertical"
          class="hidden data-[orientation=vertical]:h-6 sm:block"
        />

        <div class="min-w-0">
          <h1
            class="truncate text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
          >
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground"
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
          class="relative size-9 bg-background"
          aria-label="Notifications"
        >
          <Bell class="size-4" />
          <span
            class="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background"
          />
        </Button>
        <Avatar class="size-9 rounded-md border">
          <AvatarFallback
            class="rounded-md bg-sidebar-primary text-sidebar-primary-foreground"
          >
            T
          </AvatarFallback>
        </Avatar>
      </div>
    </div>

    <div class="grid gap-2 sm:grid-cols-3">
      <div
        class="flex min-h-12 items-center justify-between rounded-md border bg-card px-3 py-2"
      >
        <span class="text-xs font-medium text-muted-foreground">Profit</span>
        <span
          class="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
        >
          +24.1%
        </span>
      </div>
      <div
        class="flex min-h-12 items-center justify-between rounded-md border bg-card px-3 py-2"
      >
        <span class="text-xs font-medium text-muted-foreground">Runway</span>
        <span class="text-sm font-semibold text-foreground">8.5 months</span>
      </div>
      <div
        class="flex min-h-12 items-center justify-between rounded-md border bg-card px-3 py-2"
      >
        <span
          class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Sparkles class="size-3.5 text-primary" />
          AI brief
        </span>
        <span class="text-sm font-semibold text-foreground">Ready</span>
      </div>
    </div>
  </header>
</template>
