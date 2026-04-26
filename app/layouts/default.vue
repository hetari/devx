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
    <SidebarInset>
      <main class="min-h-dvh flex-1 p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
