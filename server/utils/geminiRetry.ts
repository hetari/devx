// Resilient Gemini wrapper. Retries 5xx / overload errors with short backoff,
// falls back to a smaller model if the primary keeps failing. The hackathon
// demo cannot afford a single transient 503 from Gemini killing the boardroom.
//
// Use:
//   const ai = new GoogleGenerativeAI(apiKey);
//   const text = await callGeminiResilient(ai, {
//     models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'],
//     systemInstruction,
//     generationConfig,
//     contents,           // string | Part[] (multimodal)
//   });

import type { GoogleGenerativeAI, GenerationConfig, Content, Part } from '@google/generative-ai';

export interface ResilientCallOptions {
  models?: string[];                    // ordered fallback list
  systemInstruction?: string;
  generationConfig?: GenerationConfig;
  contents: string | Array<string | Part>;
  maxAttemptsPerModel?: number;         // default 2
  baseDelayMs?: number;                 // default 600
}

// Models known to be live on the v1beta API for generateContent. Order is
// primary → fallback. We prefer gemini-2.0-flash as the primary because its
// free-tier daily quota is dramatically higher than gemini-2.5-flash (which
// caps at ~20 RPD on the free tier). 2.5 stays in the chain as a quality
// upgrade for paid keys; gemini-flash-latest is the last-resort alias.
// gemini-1.5-flash is deprecated in v1beta and intentionally NOT listed.
const DEFAULT_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

const isTransientError = (err: any): boolean => {
  const msg = String(err?.message ?? err ?? '');
  // 5xx, rate-limit text, model-not-available are all "try the next model".
  // 404 isn't transient on this model but IS reason to fall through to the
  // next one in the chain — caller logic handles that via the fallback walk.
  return /50[0-9]|overload|rate[-_ ]?limit|temporar|exceeded|try again|busy|429/i.test(msg);
};

const isNotFoundError = (err: any): boolean => {
  const msg = String(err?.message ?? err ?? '');
  return /\b404\b|not found|is not supported/i.test(msg);
};

// 429 = quota exhausted. Retrying or trying a fallback model burns more
// quota and never recovers within the same request. Bail out fast.
const isQuotaExceeded = (err: any): boolean => {
  const msg = String(err?.message ?? err ?? '');
  return /\b429\b|exceeded.+quota|quota.+exceeded|RESOURCE_EXHAUSTED/i.test(msg);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const normalizeContents = (
  c: ResilientCallOptions['contents']
): string | Content[] => {
  if (typeof c === 'string') return c;
  // Array form: build a single user message with all parts.
  const parts: Part[] = c.map((part) =>
    typeof part === 'string' ? ({ text: part } as Part) : part
  );
  return [{ role: 'user', parts }];
};

export async function callGeminiResilient(
  ai: GoogleGenerativeAI,
  opts: ResilientCallOptions
): Promise<string> {
  const models = opts.models ?? DEFAULT_MODELS;
  const maxAttempts = opts.maxAttemptsPerModel ?? 2;
  const baseDelay = opts.baseDelayMs ?? 600;

  let lastErr: any = null;

  for (const modelName of models) {
    const model = ai.getGenerativeModel({
      model: modelName,
      systemInstruction: opts.systemInstruction,
      generationConfig: opts.generationConfig,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(normalizeContents(opts.contents) as any);
        return result.response.text();
      } catch (err: any) {
        lastErr = err;
        const transient = isTransientError(err);
        const notFound = isNotFoundError(err);
        const quota = isQuotaExceeded(err);
        const isLastAttemptForModel = attempt === maxAttempts;
        const isLastModel = modelName === models[models.length - 1];

        // 429 quota exhausted: stop everything immediately. Trying again will
        // just burn more quota and fail the same way.
        if (quota) throw err;

        // 404 on this model name → don't waste retries, jump to next model.
        if (notFound) break;

        // Non-transient errors stop retries on this model, but still try fallback models.
        if (!transient && !isLastAttemptForModel) break;

        if (transient && !isLastAttemptForModel) {
          const jitter = Math.floor(Math.random() * 200);
          await sleep(baseDelay * attempt + jitter);
          continue;
        }
        if (isLastAttemptForModel && isLastModel) {
          throw err;
        }
        // else: fall through to next model
        break;
      }
    }
  }

  throw lastErr ?? new Error('Gemini call failed without specific error');
}
