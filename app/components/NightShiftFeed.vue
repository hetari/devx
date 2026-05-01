<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  Moon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Mail,
  AlertTriangle,
  Package,
  Megaphone,
  Loader2,
  Gavel,
  FileText,
} from "lucide-vue-next";
import { useAgents } from "~/composables/useAgents";
import { useBoardroom } from "~/composables/useBoardroom";
import type { AgentId } from "~/types";
import AgentAvatar from "./AgentAvatar.vue";

interface NightShiftEvent {
  id: string;
  agent: AgentId;
  eventType: "note" | "brief" | "action" | "convene";
  topic: string;
  payload: Record<string, unknown> & {
    actionType?: string;
    severity?: "low" | "medium" | "high";
    [k: string]: unknown;
  };
  actionTaken: string | null;
  status: "pending" | "approved" | "rejected" | "executed";
  createdAt: string;
}

const { getAgent } = useAgents();
const boardroom = useBoardroom();

const events = ref<NightShiftEvent[]>([]);
const loading = ref(false);
const ticking = ref(false);
const error = ref<string | null>(null);

const fetchFeed = async () => {
  loading.value = true;
  try {
    events.value = await $fetch<NightShiftEvent[]>(
      "/api/night-shift/feed?limit=15",
    );
  } catch (e: any) {
    error.value = e?.message || "تعذر تحميل التغذية";
  } finally {
    loading.value = false;
  }
};

const runTickNow = async () => {
  ticking.value = true;
  error.value = null;
  try {
    await $fetch("/api/night-shift/tick", { method: "POST", body: {} });
    await fetchFeed();
  } catch (e: any) {
    error.value = e?.message || "تعذر تشغيل الوردية الليلية";
  } finally {
    ticking.value = false;
  }
};

const decide = async (id: string, decision: "approved" | "rejected") => {
  try {
    await $fetch("/api/night-shift/decide", {
      method: "POST",
      body: { eventId: id, decision },
    });
    events.value = events.value.map((e) =>
      e.id === id ? { ...e, status: decision } : e,
    );
  } catch {
    // swallow — UI shows stale state, user can retry
  }
};

const conveneFromEvent = (ev: NightShiftEvent) => {
  boardroom.open({ topic: ev.topic, trigger: "background" });
};

const counts = computed(() => {
  const map: Record<string, number> = {
    action: 0,
    brief: 0,
    note: 0,
    convene: 0,
  };
  for (const e of events.value) map[e.eventType] = (map[e.eventType] ?? 0) + 1;
  return map;
});

const eventIcon = (ev: NightShiftEvent) => {
  const at = ev.payload?.actionType;
  if (ev.eventType === "convene") return Gavel;
  if (at === "draft_invoice_reminder") return Mail;
  if (
    at === "draft_social_post" ||
    at === "pricing_opportunity" ||
    at === "promo_idea"
  )
    return Megaphone;
  if (
    at === "flag_supplier_price" ||
    at === "inventory_risk" ||
    at === "suggest_reorder"
  )
    return Package;
  if (at === "flag_runway_risk" || at === "margin_brief") return AlertTriangle;
  return Sparkles;
};

const severityClass = (ev: NightShiftEvent) => {
  const s = ev.payload?.severity ?? "low";
  switch (s) {
    case "high":
      return "border-red-400/40 bg-red-500/10";
    case "medium":
      return "border-amber-400/40 bg-amber-500/10";
    default:
      return "border-white/10 bg-white/5";
  }
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ar", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const summaryLabel = computed(() => {
  if (!events.value.length)
    return "لم يبدأ المجلس وردية ليلية بعد. اضغط الزر لتشغيل أول وردية.";
  const a = counts.value.action ?? 0;
  const b = counts.value.brief ?? 0;
  const c = counts.value.convene ?? 0;
  const parts = [];
  if (a) parts.push(`${a} مسودة`);
  if (b) parts.push(`${b} ملاحظة`);
  if (c) parts.push(`${c} طلب اجتماع`);
  return `أثناء غيابك: ${parts.join(" · ")}`;
});

onMounted(fetchFeed);
</script>

<template>
  <div
    class="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="rounded-xl bg-primary/15 p-2.5">
          <Moon class="size-5 text-primary" />
        </div>
        <div>
          <div class="text-sm font-bold uppercase tracking-wider opacity-70">
            الوردية الليلية
          </div>
          <div class="text-base font-semibold">{{ summaryLabel }}</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <a
          href="/api/briefings/weekly"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-white/5 transition-colors"
        >
          <FileText class="size-4" />
          <span>الموجز الأسبوعي</span>
        </a>

        <Button
          :disabled="ticking"
          class="gap-2"
          variant="default"
          @click="runTickNow"
        >
          <Loader2 v-if="ticking" class="size-4 animate-spin" />
          <Sparkles v-else class="size-4" />
          <span>شغّل وردية الآن</span>
        </Button>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="mx-5 my-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm"
    >
      {{ error }}
    </div>

    <!-- Feed -->
    <div class="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
      <div
        v-if="loading && !events.length"
        class="p-8 text-center text-sm opacity-60"
      >
        <Loader2 class="size-5 animate-spin inline-block" />
      </div>

      <div
        v-else-if="!events.length"
        class="p-8 text-center text-sm opacity-60"
      >
        لا توجد أحداث بعد.
      </div>

      <div
        v-for="ev in events"
        :key="ev.id"
        :class="[
          'flex items-start gap-3 rounded-2xl border p-4 transition-all',
          severityClass(ev),
        ]"
      >
        <!-- Agent avatar -->
        <div class="shrink-0">
          <AgentAvatar
            :agent="ev.agent"
            state="idle"
            size="sm"
            :show-label="false"
          />
        </div>

        <!-- Body -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-2">
              <component :is="eventIcon(ev)" class="size-4" />
              <span class="text-sm font-bold">{{
                getAgent(ev.agent).arabicName
              }}</span>
              <span
                class="text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2 py-0.5 opacity-70"
              >
                {{ ev.eventType }}
              </span>
            </div>
            <span class="text-[10px] opacity-50">{{
              formatTime(ev.createdAt)
            }}</span>
          </div>

          <div class="text-sm leading-relaxed">{{ ev.topic }}</div>
          <div v-if="ev.actionTaken" class="text-xs mt-1 opacity-80">
            {{ ev.actionTaken }}
          </div>

          <!-- Payload preview for actions like drafted emails / posts -->
          <div
            v-if="ev.payload?.subject || ev.payload?.body || ev.payload?.idea"
            class="mt-2 rounded-lg bg-background/40 border border-white/10 p-3 text-xs space-y-1"
          >
            <div v-if="ev.payload?.subject" class="font-bold">
              {{ ev.payload.subject }}
            </div>
            <div v-if="ev.payload?.body" class="opacity-85 whitespace-pre-line">
              {{ ev.payload.body }}
            </div>
            <div v-if="ev.payload?.idea" class="opacity-85">
              {{ ev.payload.idea }}
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-3 flex items-center gap-2 flex-wrap">
            <template
              v-if="ev.eventType === 'action' && ev.status === 'pending'"
            >
              <Button
                size="sm"
                variant="default"
                class="gap-1.5"
                @click="decide(ev.id, 'approved')"
              >
                <CheckCircle2 class="size-4" /> وافق
              </Button>
              <Button
                size="sm"
                variant="ghost"
                class="gap-1.5"
                @click="decide(ev.id, 'rejected')"
              >
                <XCircle class="size-4" /> ارفض
              </Button>
            </template>

            <Button
              v-if="ev.eventType === 'convene'"
              size="sm"
              variant="default"
              class="gap-1.5"
              @click="conveneFromEvent(ev)"
            >
              <Gavel class="size-4" /> اعقد الاجتماع
            </Button>

            <span
              v-if="ev.status !== 'pending'"
              class="text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2 py-0.5 opacity-70"
            >
              {{ ev.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
