<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Save,
  RefreshCcw,
} from "lucide-vue-next";
import { useAgents } from "~/composables/useAgents";
import type { AgentId } from "~/types";
import AgentAvatar from "./AgentAvatar.vue";

interface BudgetRow {
  id: string;
  agent: AgentId;
  actionType: string;
  dailyCapAmount: number | null;
  dailyCapCount: number | null;
  requiresApprovalAbove: number | null;
  enabled: boolean;
  approvalRate: number | null;
}

interface AgentBlock {
  agent: AgentId;
  approval: { rate: number; sample: number };
  budgets: BudgetRow[];
}

const { getAgent } = useAgents();

const blocks = ref<AgentBlock[]>([]);
const loading = ref(false);
const saving = ref<string | null>(null);
const error = ref<string | null>(null);

const loadBudgets = async () => {
  loading.value = true;
  error.value = null;
  try {
    blocks.value = await $fetch<AgentBlock[]>("/api/budgets");
  } catch (e: any) {
    error.value = e?.message || "تعذر تحميل الميزانيات";
  } finally {
    loading.value = false;
  }
};

const saveRow = async (row: BudgetRow) => {
  const key = `${row.agent}:${row.actionType}`;
  saving.value = key;
  try {
    await $fetch("/api/budgets/upsert", {
      method: "POST",
      body: {
        agent: row.agent,
        actionType: row.actionType,
        dailyCapAmount: row.dailyCapAmount,
        dailyCapCount: row.dailyCapCount,
        requiresApprovalAbove: row.requiresApprovalAbove,
        enabled: row.enabled,
      },
    });
  } catch (e: any) {
    error.value = e?.message || "تعذر حفظ الميزانية";
  } finally {
    saving.value = null;
  }
};

const trustLabel = (rate: number, sample: number) => {
  if (sample === 0) return "لم يتراكم سجل بعد";
  if (rate >= 0.85) return "ثقة عالية";
  if (rate >= 0.6) return "ثقة متوسطة";
  if (rate >= 0.3) return "ثقة محدودة";
  return "ثقة منخفضة";
};

const trustClass = (rate: number, sample: number) => {
  if (sample === 0) return "bg-white/10 text-white";
  if (rate >= 0.85)
    return "bg-emerald-500/20 text-emerald-200 border-emerald-400/30";
  if (rate >= 0.6) return "bg-amber-500/20 text-amber-200 border-amber-400/30";
  return "bg-red-500/20 text-red-200 border-red-400/30";
};

const actionTypeLabel = (at: string) => {
  const map: Record<string, string> = {
    send_invoice_reminder: "تذكير الفواتير",
    flag_runway_risk: "تحذير الفترة النقدية",
    draft_social_post: "مسودة منشور",
    pricing_opportunity: "فرصة تسعير",
    flag_supplier_price: "تنبيه أسعار المورد",
    suggest_reorder: "اقتراح إعادة طلب",
  };
  return map[at] || at;
};

onMounted(loadBudgets);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <ShieldCheck class="size-5 text-primary" />
        <h2 class="text-lg font-bold">قرص الثقة (Trust Dial)</h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        :disabled="loading"
        class="gap-2"
        @click="loadBudgets"
      >
        <Loader2 v-if="loading" class="size-3 animate-spin" />
        <RefreshCcw v-else class="size-3" />
        تحديث
      </Button>
    </div>

    <p class="text-sm text-muted-foreground">
      كل عضو في المجلس يبدأ بصلاحيات محدودة. كلما وافقت على إجراءاته، ترتفع نسبة
      الثقة، ويمكنك توسيع ميزانيته.
    </p>

    <div
      v-if="error"
      class="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
    >
      {{ error }}
    </div>

    <div
      v-for="block in blocks"
      :key="block.agent"
      class="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md p-5 shadow-xl"
    >
      <!-- Agent header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <AgentAvatar
            :agent="block.agent"
            state="idle"
            size="sm"
            :show-label="false"
          />
          <div>
            <div class="text-base font-bold">
              {{ getAgent(block.agent).arabicName }}
            </div>
            <div class="text-xs opacity-60">
              {{ getAgent(block.agent).domain }}
            </div>
          </div>
        </div>
        <div
          :class="[
            'rounded-full border px-3 py-1.5 text-xs font-bold flex items-center gap-2',
            trustClass(block.approval.rate, block.approval.sample),
          ]"
        >
          <ShieldAlert v-if="block.approval.sample === 0" class="size-3.5" />
          <ShieldCheck v-else class="size-3.5" />
          <span>{{
            trustLabel(block.approval.rate, block.approval.sample)
          }}</span>
          <span v-if="block.approval.sample > 0" class="opacity-80">
            ({{ Math.round(block.approval.rate * 100) }}% /
            {{ block.approval.sample }} قرار)
          </span>
        </div>
      </div>

      <!-- Budgets list -->
      <div class="space-y-3">
        <div
          v-for="row in block.budgets"
          :key="row.actionType"
          class="rounded-2xl border border-white/10 bg-background/40 p-4 grid gap-3"
        >
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="font-bold text-sm">
              {{ actionTypeLabel(row.actionType) }}
            </div>
            <div class="flex items-center gap-2 text-xs">
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  v-model="row.enabled"
                  type="checkbox"
                  class="size-4 accent-primary"
                />
                <span>{{ row.enabled ? "مفعل" : "متوقف" }}</span>
              </label>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <div class="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                حد العدد اليومي
              </div>
              <input
                v-model.number="row.dailyCapCount"
                type="number"
                min="0"
                class="w-full rounded-md border border-white/10 bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                حد المبلغ اليومي ($)
              </div>
              <input
                v-model.number="row.dailyCapAmount"
                type="number"
                min="0"
                class="w-full rounded-md border border-white/10 bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                يطلب موافقتك أعلى من ($)
              </div>
              <input
                v-model.number="row.requiresApprovalAbove"
                type="number"
                min="0"
                class="w-full rounded-md border border-white/10 bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              size="sm"
              :disabled="saving === `${row.agent}:${row.actionType}`"
              class="gap-1.5"
              @click="saveRow(row)"
            >
              <Loader2
                v-if="saving === `${row.agent}:${row.actionType}`"
                class="size-3 animate-spin"
              />
              <Save v-else class="size-3" />
              حفظ
            </Button>
          </div>
        </div>

        <div
          v-if="!block.budgets.length"
          class="rounded-2xl border border-white/10 bg-background/30 p-4 text-sm opacity-70"
        >
          لا توجد ميزانيات بعد لهذا العضو.
        </div>
      </div>
    </div>

    <div
      v-if="!loading && !blocks.length"
      class="rounded-2xl border border-white/10 bg-background/30 p-8 text-center text-sm opacity-70"
    >
      لا توجد بيانات.
    </div>
  </div>
</template>
