<script setup lang="ts">
import { ref, computed } from 'vue';
import { Loader2, X, Gavel, MessageSquareQuote, RotateCcw } from 'lucide-vue-next';
import { useBoardroom } from '~/composables/useBoardroom';
import AgentDebateCard from './AgentDebateCard.vue';

const {
  phase,
  topic,
  stances,
  currentSpeaker,
  outcome,
  error,
  isOpen,
  submitDecision,
  reset,
} = useBoardroom();

const overrideOpen = ref(false);
const overrideText = ref('');

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'convening': return 'يجمع المجلس آراءه...';
    case 'debating':  return 'الأعضاء يستعدون';
    case 'speaking':  return 'الأعضاء يتحدثون';
    case 'deciding':  return 'القرار بيدك';
    case 'closing':   return 'تم الحفظ';
    default:          return '';
  }
});

const showActions = computed(() => phase.value === 'deciding');
const isLoading = computed(() => phase.value === 'convening' || phase.value === 'closing');

const handleApprove = (agentId: any) => {
  submitDecision('approved', { approvedAgent: agentId });
};

const submitOverride = () => {
  if (!overrideText.value.trim()) return;
  submitDecision('override', { overrideText: overrideText.value.trim() });
  overrideText.value = '';
  overrideOpen.value = false;
};

const handleDismiss = () => {
  submitDecision('dismissed');
};
</script>

<template>
  <Transition
    enter-active-class="animate-in fade-in duration-300"
    leave-active-class="animate-out fade-out duration-300"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-2xl p-4 md:p-8"
    >
      <!-- Top bar -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-wider opacity-80">
        <div class="flex items-center gap-2">
          <Gavel class="size-4" />
          <span>اجتماع المجلس</span>
        </div>
        <button class="rounded-full p-2 hover:bg-white/10" aria-label="إغلاق" @click="reset">
          <X class="size-5" />
        </button>
      </div>

      <!-- Phase chip -->
      <div class="mb-2 flex items-center gap-2 text-xs opacity-70">
        <Loader2 v-if="isLoading" class="size-3 animate-spin" />
        <span>{{ phaseLabel }}</span>
      </div>

      <!-- Topic -->
      <h2 class="mb-8 max-w-3xl text-center text-2xl md:text-3xl font-bold leading-snug" dir="rtl">
        {{ topic || '...' }}
      </h2>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-4 rounded-xl border border-destructive/40 bg-destructive/20 px-4 py-2 text-sm"
        dir="rtl"
      >
        {{ error }}
      </div>

      <!-- Stances row -->
      <div
        v-if="stances.length"
        class="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AgentDebateCard
          v-for="stance in stances"
          :key="stance.agentId"
          :stance="stance"
          :is-speaking="currentSpeaker === stance.agentId"
          :show-approve="showActions"
          @approve="handleApprove"
        />
      </div>

      <!-- Bottom actions -->
      <div v-if="showActions" class="mt-10 flex w-full max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-center">
        <Button variant="outline" class="gap-2" @click="overrideOpen = !overrideOpen">
          <MessageSquareQuote class="size-4" />
          <span dir="rtl">قراري الخاص</span>
        </Button>
        <Button variant="ghost" class="gap-2" @click="handleDismiss">
          <RotateCcw class="size-4" />
          <span dir="rtl">أجل القرار</span>
        </Button>
      </div>

      <!-- Override input -->
      <Transition
        enter-active-class="animate-in fade-in slide-in-from-bottom-3 duration-200"
        leave-active-class="animate-out fade-out duration-150"
      >
        <div
          v-if="overrideOpen && showActions"
          class="mt-6 w-full max-w-2xl rounded-2xl border border-white/15 bg-background/80 p-4 shadow-2xl backdrop-blur-xl"
          dir="rtl"
        >
          <label class="mb-2 block text-sm font-bold">قرارك بنفسك:</label>
          <textarea
            v-model="overrideText"
            rows="3"
            class="w-full resize-none rounded-lg border border-white/10 bg-background/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder="اكتب القرار النهائي..."
          />
          <div class="mt-3 flex justify-end gap-2">
            <Button variant="ghost" @click="overrideOpen = false">إلغاء</Button>
            <Button :disabled="!overrideText.trim()" @click="submitOverride">حفظ القرار</Button>
          </div>
        </div>
      </Transition>

      <!-- Outcome banner -->
      <Transition
        enter-active-class="animate-in fade-in slide-in-from-bottom-3 duration-300"
        leave-active-class="animate-out fade-out duration-200"
      >
        <div
          v-if="outcome"
          class="mt-8 max-w-2xl rounded-2xl border border-white/20 bg-primary/15 px-6 py-4 text-center text-base font-medium backdrop-blur-md"
          dir="rtl"
        >
          {{ outcome }}
        </div>
      </Transition>
    </div>
  </Transition>
</template>
