<script setup lang="ts">
// Receipt-to-Transaction capture button. The user picks/snaps a photo,
// we send it to /api/integrations/ocr, then hand the parsed expenses to
// the existing preview pipeline so the user can confirm before saving.

import { ref } from 'vue';
import { Camera, Loader2, FileWarning } from 'lucide-vue-next';
import { useAIAssistantState } from '~/composables/useAIAssistant';

const { previewData, robotState } = useAIAssistantState();

const fileInput = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const error = ref<string | null>(null);

const trigger = () => fileInput.value?.click();

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });

const onFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  busy.value = true;
  error.value = null;
  try {
    const dataUrl = await fileToBase64(file);
    const res = await $fetch<{ preview: { revenues: any[]; expenses: any[] } }>(
      '/api/integrations/ocr',
      { method: 'POST', body: { imageBase64: dataUrl, mimeType: file.type || 'image/jpeg' } }
    );
    previewData.value = res.preview;
    robotState.value = 'preview_ready';
  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'تعذر قراءة الإيصال';
  } finally {
    busy.value = false;
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
      <div class="text-xs opacity-70">صورة من ورقة → معاملة جاهزة للتأكيد</div>
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
  </div>
</template>
