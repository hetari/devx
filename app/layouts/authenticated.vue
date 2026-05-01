<script setup lang="ts">
import { ConfigProvider } from "reka-ui";
const appName = siteConfig.name;

useSeoMeta({
  title: siteConfig.title,
  description: siteConfig.description,
  ogTitle: siteConfig.title,
  ogDescription: siteConfig.description,
  ogImage: siteConfig.ogImage,
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: {
    lang: "ar",
  },
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} · ${appName}` : siteConfig.title,
});
</script>

<template>
  <ConfigProvider direction="rtl">
    <SidebarProvider class="min-h-dvh bg-background text-foreground">
      <AppSidebar />
      <SidebarInset>
        <main class="min-h-dvh flex-1 p-4">
          <slot />
        </main>

        <!-- Global AI FAB (Floating Action Button) -->
        <NuxtLink
          v-if="$route.path !== '/chat'"
          to="/chat"
          class="fixed bottom-6 end-6 z-50 flex items-center justify-center size-16 rounded-full bg-primary shadow-2xl hover:scale-110 active:scale-95 transition-all animate-float border-2 border-white/20 group"
        >
          <img
            src="/robot/0.png"
            class="size-10 object-contain drop-shadow-lg"
          />

          <!-- Live Status Badge -->
          <span class="absolute -top-1 -end-1 flex size-5">
            <span
              class="animate-ping absolute inline-flex size-full rounded-full bg-white opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full size-5 bg-white text-[7px] text-primary font-black items-center justify-center shadow-sm"
              >مباشر</span
            >
          </span>

          <!-- Hover Tooltip -->
          <span
            class="absolute end-full me-4 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl"
          >
            تحدث مع شريكك
          </span>
        </NuxtLink>
      </SidebarInset>

      <!-- Global Boardroom overlay — appears whenever a session is convened
         (from voice tool call, manual trigger, scheduled tick, etc.) -->
      <Boardroom />
    </SidebarProvider>
  </ConfigProvider>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
