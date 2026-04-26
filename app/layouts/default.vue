<script setup lang="ts">
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
    lang: "en",
  },
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} · ${appName}` : siteConfig.title,
});
</script>

<template>
  <SidebarProvider class="min-h-dvh bg-background text-foreground">
    <AppSidebar />
    <main class="min-h-dvh flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </SidebarProvider>
</template>
