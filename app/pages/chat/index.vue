<script setup lang="ts">
import { ref, computed } from "vue";
import { Bot, Settings, Gavel } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useBoardroom } from "~/composables/useBoardroom";
import { useAIAssistant } from "~/composables/useAIAssistant";
import type { AgentId, RobotState } from "~/types";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "غرفة شريكك الذكي",
});

const { open: openBoardroom, isOpen: boardroomOpen } = useBoardroom();
const { toggleListen, activeAgent, robotState, isSessionActive } =
  useAIAssistant();
const boardTopic = ref("");

// Tapping a specialist starts (or stops) a live voice session as that agent.
// The active agent's avatar mirrors the chair's listening / understanding /
// preview / saved state so it feels alive, exactly like the chair button.
const onAgentClick = (agent: AgentId) => {
  toggleListen(agent);
};

// Map the global RobotState onto the simpler idle/listening states each
// AgentAvatar understands. Only the *currently active* agent reflects state.
const stateFor = (agent: AgentId): "idle" | "listening" => {
  if (!isSessionActive.value || activeAgent.value !== agent) return "idle";
  const s: RobotState = robotState.value;
  return s === "idle" ? "idle" : "listening";
};

const speakingFor = (agent: AgentId): boolean =>
  isSessionActive.value &&
  activeAgent.value === agent &&
  robotState.value !== "idle";

const SAMPLE_TOPICS = [
  "هل أرفع أسعاري بنسبة 5% الشهر القادم؟",
  "هل أصرف على إعلان تسويقي بقيمة 500$؟",
  "هل أوقف التعامل مع المورد المتأخر؟",
  "هل أوظف موظفاً جديداً الآن؟",
];

const conveneNow = (t?: string) => {
  const topic = (t ?? boardTopic.value).trim();
  if (!topic) return;
  openBoardroom({ topic, trigger: "user" });
  boardTopic.value = "";
};
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader
      title="غرفة اجتماع شريكك"
      subtitle="تنسيق استراتيجي وتشغيلي مباشر."
    >
      <Button
        variant="outline"
        class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider"
      >
        <Settings class="size-4" />
        إعدادات الذكاء
      </Button>
    </AppHeader>

    <div
      class="flex-1 flex flex-col items-center justify-center relative mt-4 p-8"
    >
      <!-- Background ambient glow only — no card / border / dot-grid container -->
      <div
        class="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"
      ></div>

      <div
        class="relative z-10 w-full max-w-6xl flex flex-col items-center gap-4"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <span class="relative flex size-2">
              <span
                class="animate-ping absolute inline-flex size-full rounded-full bg-primary opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full size-2 bg-primary"
              ></span>
            </span>
            الاتصال المباشر نشط
          </div>
          <h2
            class="text-3xl md:text-4xl font-black uppercase tracking-tighter"
          >
            شريكك الذكي
          </h2>
          <p class="text-muted-foreground font-medium mt-2">
            تحدث بطبيعتك لمناقشة حالة عملك أو سجلاتك أو أهدافك.
          </p>
        </div>

        <!-- The full cast in one row, all at the same size.
             flex-nowrap keeps them on a single line; horizontal scroll kicks
             in only on very narrow viewports. Specialists are passive visual
             presence — questions are typed in the topic input below or
             spoken to the chair. -->
        <div
          class="w-full flex flex-nowrap items-end justify-center gap-3 md:gap-6"
        >
          <AgentAvatar
            agent="cfo"
            :state="stateFor('cfo')"
            :speaking="speakingFor('cfo')"
            size="xl"
            clickable
            :selected="activeAgent === 'cfo' && isSessionActive"
            @click="onAgentClick"
          />
          <AgentAvatar
            agent="cmo"
            :state="stateFor('cmo')"
            :speaking="speakingFor('cmo')"
            size="xl"
            clickable
            :selected="activeAgent === 'cmo' && isSessionActive"
            @click="onAgentClick"
          />
          <VoiceAssistant compact />
          <AgentAvatar
            agent="operator"
            :state="stateFor('operator')"
            :speaking="speakingFor('operator')"
            size="xl"
            clickable
            :selected="activeAgent === 'operator' && isSessionActive"
            @click="onAgentClick"
          />
        </div>

        <div
          class="mt-8 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
        >
          <span class="px-4 py-2 border rounded-full">واجهة صوتية فورية</span>
          <span class="px-4 py-2 border rounded-full"
            >استخراج بيانات العمل</span
          >
          <span class="px-4 py-2 border rounded-full"
            >مزامنة الحالة العامة</span
          >
        </div>

        <!-- Convene the Boardroom -->
        <div
          class="mt-12 w-full max-w-2xl rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Gavel class="size-5 text-primary" />
              <h3 class="text-lg font-bold">استدع المجلس</h3>
            </div>
            <span
              class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              CFO · CMO · OPERATOR
            </span>
          </div>

          <p class="text-sm text-muted-foreground mb-3">
            اطرح قراراً استراتيجياً ليتداول الأعضاء أمامك على الشاشة. للتحدث
            صوتياً مع عضو واحد، انقر على روبوته.
          </p>

          <div class="flex gap-2">
            <input
              v-model="boardTopic"
              :disabled="boardroomOpen"
              type="text"
              placeholder="مثال: هل أرفع أسعاري الشهر القادم؟"
              class="flex-1 rounded-lg border border-white/10 bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40"
              @keydown.enter="conveneNow()"
            />
            <Button
              :disabled="boardroomOpen || !boardTopic.trim()"
              class="gap-2"
              @click="conveneNow()"
            >
              <Gavel class="size-4" /> اعقد الاجتماع
            </Button>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="(t, i) in SAMPLE_TOPICS"
              :key="i"
              :disabled="boardroomOpen"
              class="text-xs rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 transition-colors disabled:opacity-40"
              @click="conveneNow(t)"
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
