<script setup lang="ts">
import { computed } from "vue";
import { useAgents } from "~/composables/useAgents";
import type { AgentStance } from "~/types";
import AgentAvatar from "./AgentAvatar.vue";

interface Props {
  stance: AgentStance;
  isSpeaking?: boolean;
  showApprove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSpeaking: false,
  showApprove: true,
});

const emit = defineEmits<{
  approve: [agentId: AgentStance["agentId"]];
}>();

const { getAgent } = useAgents();
const agent = computed(() => getAgent(props.stance.agentId));

const tintBorder = computed(() => {
  const map: Record<string, string> = {
    blue: "border-blue-400/40",
    sky: "border-sky-400/40",
    orange: "border-orange-400/40",
    stone: "border-stone-400/40",
    green: "border-green-400/40",
    purple: "border-purple-400/40",
  };
  return map[agent.value.tint] || "border-primary/40";
});

const tintAccent = computed(() => {
  const map: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-200",
    sky: "bg-sky-500/10 text-sky-200",
    orange: "bg-orange-500/10 text-orange-200",
    stone: "bg-stone-500/10 text-stone-200",
    green: "bg-green-500/10 text-green-200",
    purple: "bg-purple-500/10 text-purple-200",
  };
  return map[agent.value.tint] || "bg-primary/10 text-primary-foreground";
});

const hasDisagreement = computed(
  () => (props.stance.disagreesWith?.length ?? 0) > 0,
);
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center gap-4 rounded-2xl border bg-background/60 backdrop-blur-xl p-5 shadow-2xl transition-all duration-500',
      tintBorder,
      isSpeaking
        ? 'scale-105 ring-2 ring-white/30 -translate-y-2'
        : 'scale-100',
    ]"
  >
    <AgentAvatar
      :agent="stance.agentId"
      :state="isSpeaking ? 'listening' : 'idle'"
      :speaking="isSpeaking"
      size="md"
      :show-label="true"
    />

    <!-- Stance text -->
    <div
      class="w-full max-w-xs text-center min-h-[5rem] rounded-xl px-3 py-3 text-sm leading-relaxed"
      :class="tintAccent"
    >
      {{ stance.textArabic }}
    </div>

    <!-- Suggested action chip -->
    <div
      v-if="stance.suggestedAction"
      class="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
    >
      <div class="font-bold mb-1">{{ stance.suggestedAction.label }}</div>
      <div class="opacity-80">{{ stance.suggestedAction.detail }}</div>
    </div>

    <!-- Disagreement badge -->
    <div
      v-if="hasDisagreement"
      class="text-[10px] uppercase tracking-wider rounded-full bg-red-500/20 text-red-200 px-2 py-1 border border-red-400/30"
    >
      يختلف مع {{ stance.disagreesWith!.join(" / ") }}
    </div>

    <!-- Approve button -->
    <Button
      v-if="showApprove"
      class="w-full max-w-xs"
      variant="secondary"
      @click="emit('approve', stance.agentId)"
    >
      <span>وافق على رأي {{ agent.arabicName }}</span>
    </Button>
  </div>
</template>
