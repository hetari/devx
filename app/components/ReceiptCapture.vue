<script setup lang="ts">
// Receipt-to-Transaction capture button. The user picks/snaps a photo,
// we send it to /api/integrations/ocr, then hand the parsed expenses to
// the existing preview pipeline so the user can confirm before saving.

import { ref, computed } from 'vue';
import { Camera, Loader2, FileWarning, CheckCircle2, XCircle, Trash2 } from 'lucide-vue-next';
import { useOCR } from '~/composables/useOCR';
import { useAIAssistant } from '~/composables/useAIAssistant';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const removeRevenue = (index: number) => {
  if (previewData.value) {
    previewData.value.revenues.splice(index, 1);
  }
};

const removeExpense = (index: number) => {
  if (previewData.value) {
    previewData.value.expenses.splice(index, 1);
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
      <DialogContent class="sm:max-w-[500px] border-white/10 bg-card/95 backdrop-blur-xl max-h-[90vh] flex flex-col p-0 overflow-hidden" dir="rtl">
        <DialogHeader class="p-6 pb-2">
          <DialogTitle class="text-xl font-black tracking-tight text-right">تأكيد وتعديل البيانات</DialogTitle>
          <DialogDescription class="text-right">
            تأكد من دقة البيانات المستخرجة. يمكنك تعديل أي حقل قبل الحفظ.
          </DialogDescription>
        </DialogHeader>

        <div v-if="previewData" class="flex-1 overflow-y-auto p-6 pt-2 space-y-8">
          <!-- AI Summary & Date Edit -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary block px-1">ملخص الذكاء الاصطناعي</Label>
              <textarea 
                v-model="previewData.summary"
                class="w-full min-h-[80px] rounded-xl bg-primary/5 p-3 border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none italic"
                placeholder="اكتب ملخصاً للمستند..."
              ></textarea>
            </div>
            <div class="space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary block px-1">تاريخ المستند</Label>
              <Input 
                v-model="previewData.date"
                type="date"
                class="bg-primary/5 border-primary/10 h-[80px] text-center font-mono"
              />
            </div>
          </div>

          <!-- Revenues List -->
          <div v-if="previewData.revenues.length > 0" class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-chart-4/20"></div>
              <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-chart-4">الإيرادات / الدخل</h5>
              <div class="h-px flex-1 bg-chart-4/20"></div>
            </div>
            
            <div class="space-y-4">
              <div v-for="(r, i) in previewData.revenues" :key="i" class="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 group relative">
                <button @click="removeRevenue(i)" class="absolute top-2 left-2 p-1.5 text-white/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 class="size-3.5" />
                </button>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="col-span-2 space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">العنوان</Label>
                    <Input v-model="r.title" class="bg-white/5 border-white/10" placeholder="وصف الدخل..." />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">المبلغ ($)</Label>
                    <Input v-model.number="r.amount" type="number" class="bg-white/5 border-white/10 font-mono" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">التصنيف</Label>
                    <Input v-model="r.category" class="bg-white/5 border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Expenses List -->
          <div v-if="previewData.expenses.length > 0" class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-destructive/20"></div>
              <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">المصاريف / التكاليف</h5>
              <div class="h-px flex-1 bg-destructive/20"></div>
            </div>

            <div class="space-y-4">
              <div v-for="(e, i) in previewData.expenses" :key="i" class="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 group relative">
                <button @click="removeExpense(i)" class="absolute top-2 left-2 p-1.5 text-white/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 class="size-3.5" />
                </button>

                <div class="grid grid-cols-2 gap-3">
                  <div class="col-span-2 space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">العنوان</Label>
                    <Input v-model="e.title" class="bg-white/5 border-white/10" placeholder="وصف الصرف..." />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">المبلغ ($)</Label>
                    <Input v-model.number="e.amount" type="number" class="bg-white/5 border-white/10 font-mono" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-[10px] opacity-60 uppercase tracking-wider px-1">التصنيف</Label>
                    <Input v-model="e.category" class="bg-white/5 border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="p-6 pt-2 flex flex-row gap-3 sm:justify-start bg-card/50 backdrop-blur-md border-t border-white/5">
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
