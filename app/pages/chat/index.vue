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
      title="AI Co-Founder"
      subtitle="Your AI business partner, here to help you grow."
    >
      <Button variant="outline">
        <Settings class="size-4" />
        AI Settings
      </Button>
    </AppHeader>

    <section class="rounded-md border bg-card p-6">
      <div class="mb-6 flex items-center gap-4">
        <ToneIcon :icon="Bot" tone="primary" class="size-16" />
        <div>
          <h2 class="text-2xl font-semibold tracking-normal">Hi Tariq</h2>
          <p class="mt-1 text-muted-foreground">
            Ask about cash flow, expenses, sales, or next actions.
          </p>
        </div>
      </div>

      <div class="grid gap-4">
        <div
          class="ml-auto max-w-xl rounded-md bg-primary px-4 py-3 text-primary-foreground"
        >
          Why are my expenses so high this month?
        </div>
        <div
          class="max-w-2xl rounded-md border bg-background px-4 py-3 leading-7"
        >
          Your expenses are <strong>63%</strong> of revenue this month.
          Materials, delivery, and marketing are the main drivers. Start by
          negotiating supplier pricing and grouping nearby deliveries.
        </div>
      </div>

      <div
        class="mt-6 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border bg-background p-2"
      >
        <Button variant="ghost" size="icon" aria-label="Attach file">
          <Paperclip class="size-4" />
        </Button>
        <Input
          v-model="message"
          placeholder="Type your message here..."
          class="border-0 shadow-none focus-visible:ring-0"
        />
        <Button variant="ghost" size="icon" aria-label="Voice input">
          <Mic class="size-4" />
        </Button>
        <Button size="icon" aria-label="Send message">
          <Send class="size-4" />
        </Button>
      </div>
    </section>
  </div>
</template>
