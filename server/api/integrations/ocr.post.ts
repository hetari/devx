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
  summary: string | null;
  isFinancial: boolean;
  items: Array<{ title: string; amount: number; quantity?: number; type: 'expense' | 'revenue' }>;
}

const PROMPT = `
أنت مساعد محاسبة خبير. مهمتك هي تحليل صورة مستند (فاتورة، إيصال، أو كشف حساب) واستخراج البيانات المالية بدقة.

أعد JSON فقط بالشكل التالي:
{
  "isFinancial": true,
  "vendor": "اسم الجهة",
  "total": رقم الإجمالي,
  "currency": "SAR/USD/EGP",
  "date": "YYYY-MM-DD",
  "category": "تصنيف مناسب",
  "summary": "ملخص باللغة العربية",
  "items": [
    { "title": "وصف", "amount": رقم, "type": "expense/revenue" }
  ]
}

- إذا كان المستند طويلاً جداً، استخرج أهم 20 عنصراً فقط.
- صنف العناصر كـ expense للمصروفات و revenue للمقبوضات.
- لا تضف أي نص خارج كائن JSON.
`.trim();

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error('[OCR DEBUG] JSON Parse Error:', e);
    // Attempt to fix common truncation by adding closing braces if missing
    if (text.trim().startsWith('{') && !text.trim().endsWith('}')) {
       try { return JSON.parse(text.trim() + '}') as T; } catch { return null; }
    }
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).geminiApiKey || config.public.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY missing in runtime config' });
  }

  const body = await readBody(event);
  const { imageBase64, mimeType } = schema.parse(body);

  const cleanBase64 = imageBase64.replace(/^data:.*?;base64,/, '');

  const ai = new GoogleGenerativeAI(apiKey);

  let extracted: ExtractedReceipt | null = null;
  let text: string | null = null;
  try {
    text = await callGeminiResilient(ai, {
      generationConfig: { 
        temperature: 0.1, 
        maxOutputTokens: 4096,
        topP: 0.8,
        topK: 40
      },
      contents: [
        { text: PROMPT },
        { inlineData: { data: cleanBase64, mimeType } },
      ],
    });
    extracted = safeJsonParse<ExtractedReceipt>(text);
  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: `OCR failed: ${err?.message || 'unknown'}` });
  }


  if (!extracted || !extracted.isFinancial) {
    throw createError({ 
      statusCode: 422, 
      statusMessage: 'عذراً، لم أجد أي بيانات مالية واضحة في هذه الصورة. يرجى التأكد من تصوير إيصال أو فاتورة.' 
    });
  }



  const items = Array.isArray(extracted.items) ? extracted.items : [];
  
  const previewRevenues = items
    .filter(it => it && it.type === 'revenue')
    .map(it => ({
      title: it.title || 'دخل من إيصال',
      amount: Number(it.amount) || 0,
      category: extracted!.category || 'عام',
    }));

  const previewExpenses = items
    .filter(it => it && it.type === 'expense')
    .map(it => ({
      title: it.title || extracted!.vendor || 'صرف',
      amount: Number(it.amount) || 0,
      category: extracted!.category || 'متفرقات',
    }));

  // If no items extracted but there is a total, fallback to a single expense (most common case for receipts)
  if (previewRevenues.length === 0 && previewExpenses.length === 0 && extracted.total) {
    previewExpenses.push({
      title: extracted.vendor || 'صرف من إيصال',
      amount: Number(extracted.total) || 0,
      category: extracted.category || 'متفرقات',
    });
  }

  return {
    extracted,
    preview: {
      revenues: previewRevenues,
      expenses: previewExpenses,
      summary: extracted.summary,
      date: extracted.date,
    },
  };
});
