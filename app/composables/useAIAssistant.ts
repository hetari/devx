import { ref, onUnmounted, shallowRef } from 'vue';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import type { RobotState, Transaction, Insight, PreviewData } from '../types';
import { createPCMBlob, decodeAudioData, decodeFromBase64 } from '../utils/audioUtils';

const SYSTEM_INSTRUCTION = `
أنت شريك مؤسس يعمل بالذكاء الاصطناعي (AI Co-Founder).
القواعد:
1. اجعل جميع ردودك الصوتية قصيرة جداً وسريعة، وتحدث دائماً باللغة العربية.
2. إذا ذكر المستخدم المبيعات، الدخل، أو المصروفات، استخدم أداة 'extract_business_event' فوراً.
3. لا تتردد أو تقدم شروحات طويلة قبل استخدام الأدوات.
4. عندما يؤكد المستخدم البيانات، استخدم أداة 'save_insight' لتحديث لوحة التحكم.
`;

// Global State
export const useAIAssistantState = () => {
  const robotState = useState<RobotState>('robot-state', () => 'idle');
  const transactions = useState<Transaction[]>('transactions', () => []);
  const insights = useState<Insight[]>('insights', () => []);
  const previewData = useState<PreviewData | null>('preview-data', () => null);
  const error = useState<string | null>('ai-error', () => null);

  return { robotState, transactions, insights, previewData, error };
};

export const useAIAssistant = () => {
  const { robotState, transactions, insights, previewData, error } = useAIAssistantState();

  const config = useRuntimeConfig();
  const API_KEY = config.public.geminiApiKey || config.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY;

  // Audio & Connection Refs (shallow to avoid Vue reactivity proxying native objects)
  const inputAudioCtx = shallowRef<AudioContext | null>(null);
  const outputAudioCtx = shallowRef<AudioContext | null>(null);
  const outputNode = shallowRef<GainNode | null>(null);
  const nextStartTime = ref<number>(0);
  const sources = shallowRef<Set<AudioBufferSourceNode>>(new Set());
  const activeStream = shallowRef<MediaStream | null>(null);
  const sessionRef = shallowRef<any>(null);
  const inputSource = shallowRef<MediaStreamAudioSourceNode | null>(null);
  const inputProcessor = shallowRef<ScriptProcessorNode | null>(null);
  const isSessionActive = ref(false);

  const initializeAudio = async () => {
    if (!inputAudioCtx.value) {
      inputAudioCtx.value = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioCtx.value) {
      outputAudioCtx.value = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNode.value = outputAudioCtx.value.createGain();
      outputNode.value.connect(outputAudioCtx.value.destination);
    }
  };

  const stopAllAudio = () => {
    sources.value.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if source already stopped
      }
    });
    sources.value.clear();
    nextStartTime.value = 0;
  };

  const cleanupConnection = () => {
    isSessionActive.value = false;
    if (inputProcessor.value) {
      inputProcessor.value.onaudioprocess = null;
      inputProcessor.value.disconnect();
      inputProcessor.value = null;
    }
    inputSource.value?.disconnect();
    inputSource.value = null;
    activeStream.value?.getTracks().forEach((track) => track.stop());
    activeStream.value = null;
    stopAllAudio();
    sessionRef.value = null;
    robotState.value = 'idle';
  };

  const sendTextMessage = (text: string) => {
    if (sessionRef.value) {
      try {
        sessionRef.value.send(text);
      } catch (err) {
        console.error('Failed to send text', err);
      }
    }
  };

  const toggleListen = async () => {
    if (isSessionActive.value) {
      sessionRef.value?.close();
      cleanupConnection();
      return;
    }

    try {
      error.value = null;
      if (!API_KEY) throw new Error("API Key is missing.");

      await initializeAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream.value = stream;

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'extract_business_event',
                  description: 'Extracts revenues and expenses from the user speech.',
                  parameters: {
                    type: 'OBJECT' as any,
                    properties: {
                      revenues: {
                        type: 'ARRAY' as any,
                        items: {
                          type: 'OBJECT' as any,
                          properties: {
                            amount: { type: 'NUMBER' as any },
                            quantity: { type: 'NUMBER' as any },
                            category: { type: 'STRING' as any },
                          },
                        },
                      },
                      expenses: {
                        type: 'ARRAY' as any,
                        items: {
                          type: 'OBJECT' as any,
                          properties: {
                            amount: { type: 'NUMBER' as any },
                            category: { type: 'STRING' as any },
                          },
                        },
                      },
                    },
                  },
                },
                {
                  name: 'save_insight',
                  description: 'Saves an insight to the dashboard after analyzing transactions.',
                  parameters: {
                    type: 'OBJECT' as any,
                    properties: {
                      what_happened: { type: 'STRING' as any },
                      why_it_matters: { type: 'STRING' as any },
                      what_it_means: { type: 'STRING' as any },
                      what_to_do: { type: 'STRING' as any },
                    },
                    required: ['what_happened', 'why_it_matters', 'what_it_means', 'what_to_do'],
                  },
                },
              ],
            },
          ],
        },
        callbacks: {
          onopen: () => {
            isSessionActive.value = true;
            robotState.value = 'listening';

            const source = inputAudioCtx.value!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtx.value!.createScriptProcessor(4096, 1, 1);
            inputSource.value = source;
            inputProcessor.value = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (!isSessionActive.value) return;

              // Only send audio if we are in listening or understanding mode
              if (robotState.value === 'listening' || robotState.value === 'understanding') {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = createPCMBlob(inputData);
                const session = sessionRef.value;
                if (session) {
                  try {
                    session.sendRealtimeInput({
                      media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' },
                    });
                  } catch (err) {
                    console.warn('Realtime input send failed:', err);
                  }
                }
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtx.value!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
              robotState.value = 'understanding';
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'extract_business_event') {
                  const args = fc.args as any;
                  previewData.value = {
                    revenues: args.revenues || [],
                    expenses: args.expenses || [],
                  };
                  robotState.value = 'preview_ready';

                  sessionPromise.then((s) =>
                    s.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: 'Data extracted. Waiting for user confirmation.' },
                      },
                    })
                  );
                } else if (fc.name === 'save_insight') {
                  const args = fc.args as any;
                  const newInsight: Insight = {
                    id: Math.random().toString(36).substr(2, 9),
                    what_happened: args.what_happened,
                    why_it_matters: args.why_it_matters,
                    what_it_means: args.what_it_means,
                    what_to_do: args.what_to_do,
                    timestamp: new Date(),
                  };
                  insights.value = [newInsight, ...insights.value];

                  sessionPromise.then((s) =>
                    s.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: 'Insight saved successfully.' },
                      },
                    })
                  );
                }
              }
            }

            // Handle Content Output
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.text) {
                console.log('AI Text:', part.text);
              }
              if (part.inlineData && part.inlineData.data) {
                robotState.value = robotState.value === 'preview_ready' ? 'preview_ready' : 'understanding';
                const buffer = await decodeAudioData(
                  decodeFromBase64(part.inlineData.data),
                  outputAudioCtx.value!,
                  24000
                );
                const source = outputAudioCtx.value!.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNode.value!);

                nextStartTime.value = Math.max(nextStartTime.value, outputAudioCtx.value!.currentTime);
                source.start(nextStartTime.value);
                nextStartTime.value += buffer.duration;

                source.onended = () => {
                  sources.value.delete(source);
                  if (sources.value.size === 0) {
                    robotState.value = robotState.value === 'understanding' ? 'listening' : robotState.value;
                  }
                };
                sources.value.add(source);
              }
            }

            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e) => {
            console.error('Gemini error:', e);
            error.value = 'Connection error occurred. Please try again.';
            cleanupConnection();
          },
          onclose: () => {
            cleanupConnection();
          },
        },
      });

      sessionRef.value = await sessionPromise;
    } catch (err: any) {
      cleanupConnection();
      error.value = err.message || 'Failed to start call';
    }
  };

  const handleConfirmPreview = () => {
    if (previewData.value) {
      const newTx: Transaction[] = [];
      const now = new Date();

      previewData.value.revenues.forEach((r) => {
        newTx.push({
          id: Math.random().toString(),
          type: 'revenue',
          amount: r.amount,
          quantity: r.quantity,
          category: r.category || 'sales',
          timestamp: now,
        });
      });

      previewData.value.expenses.forEach((e) => {
        newTx.push({
          id: Math.random().toString(),
          type: 'expense',
          amount: e.amount,
          category: e.category || 'expense',
          timestamp: now,
        });
      });

      transactions.value = [...newTx, ...transactions.value];
      previewData.value = null;
      robotState.value = 'saved';

      sendTextMessage(
        'I have confirmed and saved the transactions. Please provide an insight using the save_insight tool, explain it verbally, and suggest what to do next.'
      );

      setTimeout(() => {
        robotState.value = 'listening';
      }, 3000);
    }
  };

  const handleCancelPreview = () => {
    previewData.value = null;
    robotState.value = 'listening';
    sendTextMessage("I cancelled the preview. Let's try again.");
  };

  onUnmounted(() => {
    cleanupConnection();
  });

  return {
    robotState,
    transactions,
    insights,
    previewData,
    error,
    toggleListen,
    handleConfirmPreview,
    handleCancelPreview,
    isSessionActive,
  };
};
