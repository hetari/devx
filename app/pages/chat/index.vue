<script setup lang="ts">
import { Bot, Mic, Paperclip, Send, Settings } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "AI Chat",
});

const message = shallowRef("");
</script>

<template>
  <div>
    <AppHeader
      title="AI CO-FOUNDER"
      subtitle="Operational intelligence and strategic guidance."
    >
      <Button variant="outline" class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">
        <Settings class="size-4" />
        AI SETTINGS
      </Button>
    </AppHeader>

    <section class="rounded-md border bg-card p-6 landing-reveal">
      <div class="mb-8 flex items-center gap-4">
        <ToneIcon :icon="Bot" tone="primary" class="size-16" />
        <div>
          <h2 class="text-2xl font-black uppercase tracking-tight">OPERATOR: TARIQ</h2>
          <p class="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            System ready. Query cash flow, expenses, or growth protocols.
          </p>
        </div>
      </div>

      <div class="grid gap-6">
        <div
          class="ml-auto max-w-xl rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground"
        >
          Why are my expenses so high this month?
        </div>
        <div
          class="max-w-2xl rounded-md border border-primary/20 bg-background px-4 py-3 text-sm font-medium leading-relaxed"
        >
          <span class="block mb-2 text-[10px] font-black uppercase tracking-widest text-primary">AI ANALYSIS</span>
          Your expenses are <strong class="font-black text-destructive">63%</strong> of revenue this month.
          Materials, delivery, and marketing are the main drivers. Start by
          negotiating supplier pricing and grouping nearby deliveries.
        </div>
      </div>

      <div
        class="mt-8 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-primary/20 bg-background p-2"
      >
        <Button variant="ghost" size="icon" class="rounded-md" aria-label="Attach file">
          <Paperclip class="size-4" />
        </Button>
        <Input
          v-model="message"
          placeholder="ENTER QUERY..."
          class="border-0 shadow-none focus-visible:ring-0 text-xs font-black uppercase tracking-wider"
        />
        <Button variant="ghost" size="icon" class="rounded-md" aria-label="Voice input">
          <Mic class="size-4" />
        </Button>
        <Button size="icon" class="rounded-md bg-primary" aria-label="Send message">
          <Send class="size-4" />
        </Button>
      </div>
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
