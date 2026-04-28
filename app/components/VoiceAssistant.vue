<script setup lang="ts">
import { useAIAssistant } from '~/composables/useAIAssistant';
import { computed } from 'vue';
import { CheckCircle2, XCircle } from 'lucide-vue-next';

const {
  robotState,
  previewData,
  error,
  toggleListen,
  handleConfirmPreview,
  handleCancelPreview,
  isSessionActive
} = useAIAssistant();

const getMessage = computed(() => {
  switch (robotState.value) {
    case 'idle':
      return "مرحباً! أنا شريكك المؤسس الذكي. كيف يمكنني مساعدة عملك اليوم؟";
    case 'listening':
      return "أستمع إليك...";
    case 'understanding':
      return "أفكر وأحلل...";
    case 'preview_ready':
      return "هذا ما فهمته. يرجى التأكيد.";
    case 'saved':
      return "تم حفظ بياناتك وتحديث كل شيء!";
    default:
      return "جاهز.";
  }
});
</script>

<template>
  <div class="relative flex flex-col items-center justify-center gap-12 w-full min-h-[70vh] py-10">
    <!-- Error Bubble -->
    <Transition
      enter-active-class="animate-in fade-in slide-in-from-top-4 duration-300"
      leave-active-class="animate-out fade-out slide-in-from-top-4 duration-300"
    >
      <div v-if="error" class="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/90 p-3 text-center text-white shadow-2xl backdrop-blur-md">
        <p class="text-sm font-bold tracking-wide uppercase">{{ error }}</p>
      </div>
    </Transition>

    <!-- Preview Modal / Bubble -->
    <Transition
      enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-300"
      leave-active-class="animate-out fade-out slide-in-from-bottom-4 duration-300"
    >
      <div v-if="previewData" class="w-full max-w-md rounded-2xl border border-white/20 bg-background/90 p-6 shadow-2xl backdrop-blur-xl">
        <h4 class="font-bold mb-4 text-base">Please Confirm</h4>
        
        <div v-if="previewData.revenues.length > 0" class="mb-4">
          <h5 class="text-sm font-semibold text-chart-4 mb-2 uppercase tracking-wider">Revenues</h5>
          <ul class="text-sm space-y-2">
            <li v-for="(r, i) in previewData.revenues" :key="i" class="flex justify-between border-b border-border/50 pb-1">
              <span>{{ r.category }} (x{{ r.quantity || 1 }})</span>
              <span class="font-bold text-chart-4">+${{ r.amount }}</span>
            </li>
          </ul>
        </div>
        
        <div v-if="previewData.expenses.length > 0" class="mb-6">
          <h5 class="text-sm font-semibold text-destructive mb-2 uppercase tracking-wider">Expenses</h5>
          <ul class="text-sm space-y-2">
            <li v-for="(e, i) in previewData.expenses" :key="i" class="flex justify-between border-b border-border/50 pb-1">
              <span>{{ e.category }}</span>
              <span class="font-bold text-destructive">-${{ e.amount }}</span>
            </li>
          </ul>
        </div>

        <div class="flex gap-3">
          <Button class="flex-1 gap-2" variant="outline" @click="handleCancelPreview">
            <XCircle class="size-5" /> Cancel
          </Button>
          <Button class="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="handleConfirmPreview">
            <CheckCircle2 class="size-5" /> Confirm
          </Button>
        </div>
      </div>
    </Transition>

    <!-- Speech Bubble -->
    <Transition
      enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-300"
      leave-active-class="animate-out fade-out slide-in-from-bottom-4 duration-300"
    >
      <div v-show="!previewData && (isSessionActive || robotState !== 'idle')" class="relative w-full max-w-lg rounded-3xl border border-white/10 bg-background/80 p-6 shadow-2xl backdrop-blur-xl text-center" dir="rtl">
        <p class="text-lg md:text-xl font-medium leading-relaxed">{{ getMessage }}</p>
        <!-- Triangle pointing down to the robot -->
        <div class="absolute -bottom-3 left-1/2 w-6 h-6 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-background/80 backdrop-blur-xl"></div>
      </div>
    </Transition>

    <!-- Robot Visuals -->
    <button
      class="group relative flex size-64 md:size-80 lg:size-96 items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-float"
      :aria-label="robotState === 'listening' ? 'Stop Listening' : 'Start Voice Assistant'"
      @click="toggleListen"
    >
      <!-- Glow rings -->
      <div class="absolute inset-0 rounded-full transition-all duration-500 blur-2xl opacity-40" 
        :class="{
          'bg-blue-500 scale-100': robotState === 'idle',
          'bg-blue-400 scale-110 animate-pulse': robotState === 'listening',
          'bg-purple-500 scale-110 animate-spin-slow': robotState === 'understanding',
          'bg-orange-500 scale-105 animate-pulse': robotState === 'preview_ready',
          'bg-green-500 scale-100': robotState === 'saved'
        }"
      ></div>

      <!-- Robot Images overlapping -->
      <div class="relative w-full h-full pointer-events-none">
        <img src="/robot/0.png" alt="Idle" class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 drop-shadow-2xl" :class="robotState === 'idle' ? 'opacity-100' : 'opacity-0'" />
        <img src="/robot/2.png" alt="Listening" class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 drop-shadow-2xl" :class="robotState === 'listening' ? 'opacity-100' : 'opacity-0'" />
        <img src="/robot/2.png" alt="Understanding" class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 drop-shadow-2xl" :class="robotState === 'understanding' ? 'opacity-100' : 'opacity-0'" />
        <img src="/robot/3.png" alt="Preview/Saved" class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 drop-shadow-2xl" :class="(robotState === 'preview_ready' || robotState === 'saved') ? 'opacity-100' : 'opacity-0'" />
      </div>
    </button>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
