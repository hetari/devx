<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";

const colorMode = useColorMode();
const isDark = computed(() => colorMode.preference === "dark");
const toggleDark = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>
<template>
  <Button
    variant="outline"
    size="icon"
    class="size-9 bg-background"
    aria-label="تبديل الوضع الداكن"
    @click="toggleDark()"
  >
    <Moon v-if="!isDark" class="size-4" />
    <Sun v-else class="size-4" />
  </Button>
</template>
