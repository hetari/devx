<script setup lang="ts">
import { ArrowRight, Bot, Crown } from "lucide-vue-next";

defineProps<{
  isActive: (to: string) => boolean;
}>();
</script>

<template>
  <div class="flex h-dvh flex-col p-4">
    <NuxtLink
      to="/"
      class="flex items-center gap-3 rounded-md p-2 transition hover:bg-sidebar-accent"
    >
      <span
        class="grid size-12 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
      >
        <Bot class="size-6" />
      </span>
      <span>
        <span class="block text-base font-semibold">{{ siteConfig.name }}</span>
        <span class="block text-xs text-sidebar-foreground/70"
          >AI Business Partner</span
        >
      </span>
    </NuxtLink>

    <nav class="mt-7 grid gap-1">
      <Tooltip v-for="item in navItems" :key="item.to">
        <TooltipTrigger as-child>
          <NuxtLink
            :to="item.to"
            class="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            :class="
              isActive(item.to) &&
              'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
            "
          >
            <component :is="item.icon" class="size-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </TooltipTrigger>
        <TooltipContent side="right">
          {{ item.label }}
        </TooltipContent>
      </Tooltip>
    </nav>

    <div
      class="mt-auto rounded-md border border-sidebar-border bg-sidebar-accent/70 p-4"
    >
      <div
        class="flex items-center gap-2 font-semibold text-sidebar-accent-foreground"
      >
        <Crown class="size-5 text-primary" />
        Upgrade to Pro
      </div>
      <p class="mt-2 text-sm leading-6 text-sidebar-foreground/70">
        Unlock advanced insights, custom reports, and weekly AI strategy briefs.
      </p>
      <Button class="mt-4 w-full" size="sm">
        Upgrade
        <ArrowRight class="size-4" />
      </Button>
    </div>

    <Separator class="my-4" />

    <div class="flex items-center gap-3 rounded-md bg-sidebar-accent/50 p-3">
      <Avatar>
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">Tariq Khan</p>
        <p class="truncate text-xs text-sidebar-foreground/70">
          Business Owner
        </p>
      </div>
    </div>
  </div>
</template>
