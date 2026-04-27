<script setup lang="ts">
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Goals",
});
</script>

<template>
  <div>
    <AppHeader
      title="STRATEGIC GOALS"
      subtitle="Operational targets and growth benchmarks."
    >
      <Button class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">NEW OBJECTIVE</Button>
    </AppHeader>

    <section class="grid gap-4 xl:grid-cols-2">
      <GoalsCard class="landing-reveal" :style="{ animationDelay: '0ms' }" />
      <AssistantCard class="landing-reveal" :style="{ animationDelay: '100ms' }" />
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
