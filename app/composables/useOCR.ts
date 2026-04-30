import { ref } from 'vue';
import { useAIAssistantState } from './useAIAssistant';
import type { PreviewData } from '../types';

export const useOCR = () => {
  const { previewData, robotState, sendTextMessage, isSessionActive } = useAIAssistant();
  const busy = ref(false);
  const error = ref<string | null>(null);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error('read failed'));
      reader.readAsDataURL(file);
    });

  const processImage = async (file: File) => {
    busy.value = true;
    error.value = null;

    try {
      const dataUrl = await fileToBase64(file);
      const res = await $fetch<{ preview: PreviewData }>(
        '/api/integrations/ocr',
        { 
          method: 'POST', 
          body: { 
            imageBase64: dataUrl, 
            mimeType: file.type || 'image/jpeg' 
          } 
        }
      );

      previewData.value = res.preview;
      robotState.value = 'preview_ready';

      // If voice session is active, let the AI acknowledge the receipt
      if (isSessionActive.value) {
        const vendor = res.preview.revenues[0]?.title || res.preview.expenses[0]?.title || 'مستند جديد';
        sendTextMessage(`لقد قرأت المستند من ${vendor}. هل البيانات صحيحة؟`);
      }

      return res.preview;
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'تعذر قراءة الإيصال';
      error.value = msg;
      throw new Error(msg);
    } finally {
      busy.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    busy,
    error,
    processImage,
    clearError,
  };
};
