<script setup lang="ts">
import { Bell, CalendarDays, Download, Moon, Sun } from "lucide-vue-next";

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

const colorMode = useColorMode();
const isDark = computed(() => colorMode.preference === "dark");
const toggleDark = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>

<template>
  <header
    class="flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-semibold tracking-normal text-foreground">
        {{ title }}
      </h1>
      <p class="mt-2 text-sm text-muted-foreground sm:text-base">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2 sm:justify-end">
      <slot>
        <Button variant="outline">
          <CalendarDays class="size-4" />
          This Month
        </Button>
        <Button variant="outline">
          <Download class="size-4" />
          Export
        </Button>
      </slot>
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle dark mode"
        @click="toggleDark()"
      >
        <Moon v-if="!isDark" class="size-4" />
        <Sun v-else class="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell class="size-5" />
      </Button>
      <Avatar>
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
    </div>
  </header>
</template>
