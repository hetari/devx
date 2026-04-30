<script setup lang="ts">
import { Bot, Loader2, Mic, Paperclip, Send, Settings } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "AI Chat",
});

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const message = shallowRef("");
const messages = shallowRef<ChatMessage[]>([]);
const isSending = shallowRef(false);
const errorMessage = shallowRef("");

const canSend = computed(() => message.value.trim().length > 0 && !isSending.value);
const businessContext = computed(() => ({
  metrics: kpis.map(({ title, value, change }) => ({ title, value, change })),
  expenseCategories: categories.map(({ name, value, percent }) => ({
    name,
    value,
    percent,
  })),
  goals: goals.map(({ title, value, progress }) => ({ title, value, progress })),
}));

function createMessageId() {
  return crypto.randomUUID();
}

function getErrorMessage(error: unknown) {
  const fetchError = error as {
    data?: {
      message?: string;
      statusMessage?: string;
    };
    message?: string;
  };

  return (
    fetchError.data?.statusMessage ||
    fetchError.data?.message ||
    fetchError.message ||
    "The AI model could not respond. Check your Gemini configuration."
  );
}

async function sendMessage() {
  const content = message.value.trim();

  if (!content || isSending.value) return;

  const userMessage: ChatMessage = {
    id: createMessageId(),
    role: "user",
    content,
  };

  const history = messages.value.map(({ role, content }) => ({ role, content }));

  messages.value = [...messages.value, userMessage];
  message.value = "";
  errorMessage.value = "";
  isSending.value = true;

  try {
    const response = await $fetch<{ text: string }>("/api/gemini/chat", {
      method: "POST",
      body: {
        message: content,
        businessContext: businessContext.value,
        history,
      },
    });

    messages.value = [
      ...messages.value,
      {
        id: createMessageId(),
        role: "assistant",
        content: response.text,
      },
    ];
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSending.value = false;
  }
}
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

      <div class="grid min-h-72 content-start gap-6">
        <div
          v-if="messages.length === 0"
          class="max-w-2xl rounded-md border border-primary/20 bg-background px-4 py-3 text-sm font-medium leading-relaxed"
        >
          <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-primary">AI READY</span>
          Ask about cash flow, expense pressure, goals, reports, or the next practical move for the business.
        </div>

        <div
          v-for="chatMessage in messages"
          :key="chatMessage.id"
          :class="[
            'max-w-2xl rounded-md px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
            chatMessage.role === 'user'
              ? 'ml-auto bg-primary font-black text-primary-foreground'
              : 'border border-primary/20 bg-background font-medium',
          ]"
        >
          <span
            v-if="chatMessage.role === 'assistant'"
            class="mb-2 block text-[10px] font-black uppercase tracking-widest text-primary"
          >
            AI ANALYSIS
          </span>
          {{ chatMessage.content }}
        </div>

        <div
          v-if="isSending"
          class="flex max-w-2xl items-center gap-2 rounded-md border border-primary/20 bg-background px-4 py-3 text-sm font-medium text-muted-foreground"
        >
          <Loader2 class="size-4 animate-spin text-primary" />
          Thinking through the numbers...
        </div>

        <p
          v-if="errorMessage"
          class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {{ errorMessage }}
        </p>
      </div>

      <form
        class="mt-8 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border border-primary/20 bg-background p-2"
        @submit.prevent="sendMessage"
      >
        <Button type="button" variant="ghost" size="icon" class="rounded-md" aria-label="Attach file">
          <Paperclip class="size-4" />
        </Button>
        <Input
          v-model="message"
          placeholder="ASK THE MODEL..."
          class="border-0 text-xs font-black uppercase tracking-wider shadow-none focus-visible:ring-0"
          :disabled="isSending"
        />
        <Button type="button" variant="ghost" size="icon" class="rounded-md" aria-label="Voice input">
          <Mic class="size-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          class="rounded-md bg-primary"
          aria-label="Send message"
          :disabled="!canSend"
        >
          <Loader2 v-if="isSending" class="size-4 animate-spin" />
          <Send v-else class="size-4" />
        </Button>
      </form>
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
