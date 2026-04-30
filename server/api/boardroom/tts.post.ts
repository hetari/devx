// POST /api/boardroom/tts
// Returns Gemini-synthesized speech for a stance using the agent's prebuilt
// voice (same one the chat-page live robots use). Body: { agentId, text }.
// Response: { audioBase64, sampleRate, mimeType }.
//
// Why this exists: the Boardroom debate previously played stances through
// `window.speechSynthesis` (browser TTS), which sounds nothing like the
// chair's Gemini Live voice. Routing through Gemini TTS makes the four
// agents sound like one cast.
//
// Falls back gracefully: if Gemini TTS fails for any reason (404, quota,
// model unavailable), we throw and the client falls back to SpeechSynthesis.

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const SERVER_AGENT_VOICES: Record<'cfo' | 'cmo' | 'operator' | 'chair', string> = {
  chair: 'Aoede',
  cfo: 'Charon',
  cmo: 'Puck',
  operator: 'Fenrir',
};

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
];

const schema = z.object({
  agentId: z.enum(['chair', 'cfo', 'cmo', 'operator']),
  text: z.string().min(1).max(2000),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = (config as any).geminiApiKey || config.public.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY missing in runtime config' });
  }

  const body = await readBody(event);
  const { agentId, text } = schema.parse(body);
  const voiceName = SERVER_AGENT_VOICES[agentId];

  const ai = new GoogleGenAI({ apiKey });

  let lastError: any = null;
  for (const modelName of TTS_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'] as any,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      // Audio comes back as inline_data on the first part of the candidate's content.
      const candidates = (response as any)?.candidates ?? [];
      const parts = candidates[0]?.content?.parts ?? [];
      let audioBase64: string | null = null;
      let mimeType = 'audio/pcm;rate=24000';
      for (const p of parts) {
        const inline = p.inlineData ?? p.inline_data;
        if (inline?.data) {
          audioBase64 = inline.data;
          if (inline.mimeType || inline.mime_type) {
            mimeType = inline.mimeType ?? inline.mime_type;
          }
          break;
        }
      }
      if (!audioBase64) {
        throw new Error('TTS response had no audio inlineData');
      }

      // Default Gemini TTS sample rate is 24kHz mono PCM. Parse the rate
      // hint out of the mimeType if present (e.g. "audio/pcm;rate=24000").
      const rateMatch = /rate=(\d+)/.exec(mimeType);
      const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;

      return {
        audioBase64,
        sampleRate,
        mimeType,
        voiceName,
        modelUsed: modelName,
      };
    } catch (err: any) {
      lastError = err;
      // Try the next TTS model in the list.
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `TTS failed: ${lastError?.message || 'all TTS models exhausted'}`,
  });
});
