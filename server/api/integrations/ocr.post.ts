// POST /api/integrations/ocr
// Body: { imageBase64: string, mimeType?: string }
// Sends a receipt image to Gemini multimodal vision and returns a
// preview-shaped payload the user can confirm into a Transaction.
//
// The user's UX: snap a paper receipt with their phone camera, the image
// reaches this endpoint base64-encoded, the server returns extracted
// vendor/total/line items, and the existing preview/confirm flow takes over.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { callGeminiResilient } from '../../utils/geminiRetry';

const schema = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().default('image/jpeg'),
});

interface ExtractedReceipt {
  vendor: string | null;
  total: number | null;
  date: string | null; // ISO yyyy-mm-dd
  category: string | null;
  currency: string | null;
  items: Array<{ title: string; amount: number; quantity?: number }>;
}

const PROMPT = `
أنت مساعد محاسبة. ستحلل صورة فاتورة (إيصال) وتستخرج البيانات التالية. أعد JSON فقط بالشكل التالي بدون أي نص آخر:
{
  "vendor": "اسم المتجر أو null",
  "total": رقم نهائي للمبلغ بدون عملة، أو null,
  "currency": "USD" أو "SAR" أو "EGP" أو null,
  "date": "YYYY-MM-DD" أو null,
  "category": تصنيف عربي قصير مثل "مواد غذائية" أو "وقود" أو "موارد" أو null,
  "items": [
    { "title": "وصف العنصر بالعربية", "amount": رقم, "quantity": رقم اختياري }
  ]
}
لا تخمن. إذا لم تستطع قراءة قيمة بثقة، اجعلها null.
`.trim();

function safeJsonParse<T = unknown>(text: string): T | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).geminiApiKey || config.public.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY missing in runtime config' });
  }

  const body = await readBody(event);
  const { imageBase64, mimeType } = schema.parse(body);

  // Strip a possible data URL prefix.
  const cleanBase64 = imageBase64.replace(/^data:.*?;base64,/, '');

  const ai = new GoogleGenerativeAI(apiKey);

  let extracted: ExtractedReceipt | null = null;
  try {
    const text = await callGeminiResilient(ai, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 1200 },
      contents: [
        { text: PROMPT },
        { inlineData: { data: cleanBase64, mimeType } },
      ],
    });
    extracted = safeJsonParse<ExtractedReceipt>(text);
  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: `OCR failed: ${err?.message || 'unknown'}` });
  }

  if (!extracted) {
    throw createError({ statusCode: 422, statusMessage: 'Could not parse receipt from image' });
  }

  // Shape the response to match PreviewData so the existing preview UI can render it.
  const items = Array.isArray(extracted.items) ? extracted.items : [];
  const previewExpenses = items.length
    ? items.map((it) => ({
        title: it.title || extracted!.vendor || 'صرف',
        amount: Number(it.amount) || 0,
        category: extracted!.category || 'متفرقات',
      }))
    : extracted.total
    ? [{
        title: extracted.vendor || 'صرف من إيصال',
        amount: Number(extracted.total) || 0,
        category: extracted.category || 'متفرقات',
      }]
    : [];

  return {
    extracted,
    preview: {
      revenues: [],
      expenses: previewExpenses,
    },
  };
});
