<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Settings",
});

const businessName = shallowRef("Tariq Trading");
const currency = shallowRef("USD");
</script>

<template>
  <div>
    <AppHeader
      title="SYSTEM SETTINGS"
      subtitle="Configure business profile and operational parameters."
    />

    <section class="max-w-2xl rounded-md border bg-card p-6 landing-reveal">
      <div class="grid gap-6">
        <label class="grid gap-2">
          <Label class="text-[10px] font-black uppercase tracking-wider">Business Name</Label>
          <Input v-model="businessName" class="rounded-md h-9 text-sm font-medium focus-visible:ring-primary"/>
        </label>
        <label class="grid gap-2">
          <Label class="text-[10px] font-black uppercase tracking-wider">Currency</Label>
          <Input v-model="currency" class="rounded-md h-9 text-sm font-medium focus-visible:ring-primary"/>
        </label>
        <Button class="w-fit h-9 rounded-md text-[10px] font-black uppercase tracking-wider">SAVE CONFIGURATION</Button>
      </div>
    </section>

    <section class="mt-8 landing-reveal" :style="{ animationDelay: '160ms' }">
      <TrustDial />
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
