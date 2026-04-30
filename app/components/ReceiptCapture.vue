<script setup lang="ts">
// Receipt-to-Transaction capture button. The user picks/snaps a photo,
// we send it to /api/integrations/ocr, then hand the parsed expenses to
// the existing preview pipeline so the user can confirm before saving.

import { ref, computed } from 'vue';
import { Camera, Loader2, FileWarning, CheckCircle2, XCircle } from 'lucide-vue-next';
import { useOCR } from '~/composables/useOCR';
import { useAIAssistant } from '~/composables/useAIAssistant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const { busy, error, processImage, clearError } = useOCR();
const { previewData, handleConfirmPreview, handleCancelPreview } = useAIAssistant();
const fileInput = ref<HTMLInputElement | null>(null);

const isPreviewOpen = computed({
  get: () => !!previewData.value,
  set: (val) => {
    if (!val) handleCancelPreview();
  }
});

const trigger = () => {
  clearError();
  fileInput.value?.click();
};

const onFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    await processImage(file);
  } catch (err) {
    // Error is already handled/stored in the composable
    console.error('OCR Process failed:', err);
  } finally {
    if (input) input.value = '';
  }
};
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-card/40 p-4 flex items-center gap-3" dir="rtl">
    <div class="rounded-xl bg-primary/15 p-2.5 shrink-0">
      <Camera class="size-5 text-primary" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold">التقط إيصالاً</div>
      <div class="text-xs opacity-70">صورة من ورقة ← معاملة جاهزة للتأكيد</div>
      <div v-if="error" class="text-xs text-red-300 mt-1 flex items-center gap-1">
        <FileWarning class="size-3.5" /> {{ error }}
      </div>
    </div>
    <Button :disabled="busy" class="gap-2" @click="trigger">
      <Loader2 v-if="busy" class="size-4 animate-spin" />
      <Camera v-else class="size-4" />
      <span>{{ busy ? 'يحلل...' : 'اختر صورة' }}</span>
    </Button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onFile"
    >

    <!-- Preview Dialog -->
    <Dialog v-model:open="isPreviewOpen">
      <DialogContent class="sm:max-w-[425px] border-white/10 bg-card/95 backdrop-blur-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle class="text-xl font-black tracking-tight text-right">تأكيد البيانات المستخرجة</DialogTitle>
          <DialogDescription class="text-right">
            يرجى مراجعة البيانات التي تم استخراجها بواسطة الذكاء الاصطناعي قبل الحفظ.
          </DialogDescription>
        </DialogHeader>

        <div v-if="previewData" class="py-4 space-y-6">
          <!-- AI Summary -->
          <div v-if="previewData.summary" class="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">ملخص الذكاء الاصطناعي</h5>
            <p class="text-sm leading-relaxed opacity-90 italic">"{{ previewData.summary }}"</p>
          </div>

          <!-- Revenues -->
          <div v-if="previewData.revenues.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <div class="h-px flex-1 bg-chart-4/20"></div>
              <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-chart-4">الإيرادات / الدخل</h5>
              <div class="h-px flex-1 bg-chart-4/20"></div>
            </div>
            <ul class="space-y-3">
              <li v-for="(r, i) in previewData.revenues" :key="i" class="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold">{{ r.title || r.category }}</span>
                  <span class="text-[10px] opacity-60 uppercase">{{ r.category }}</span>
                </div>
                <span class="text-sm font-black text-chart-4">+${{ r.amount.toLocaleString() }}</span>
              </li>
            </ul>
          </div>

          <!-- Expenses -->
          <div v-if="previewData.expenses.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <div class="h-px flex-1 bg-destructive/20"></div>
              <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">المصاريف / التكاليف</h5>
              <div class="h-px flex-1 bg-destructive/20"></div>
            </div>
            <ul class="space-y-3">
              <li v-for="(e, i) in previewData.expenses" :key="i" class="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold">{{ e.title || e.category }}</span>
                  <span class="text-[10px] opacity-60 uppercase">{{ e.category }}</span>
                </div>
                <span class="text-sm font-black text-destructive">-${{ e.amount.toLocaleString() }}</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter class="flex flex-row gap-3 sm:justify-start">
          <Button variant="outline" class="flex-1 rounded-xl border-white/10 hover:bg-white/5" @click="handleCancelPreview">
            <XCircle class="size-4 ml-2" /> إلغاء
          </Button>
          <Button class="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" @click="handleConfirmPreview">
            <CheckCircle2 class="size-4 ml-2" /> تأكيد وحفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
