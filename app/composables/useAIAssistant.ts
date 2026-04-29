import { ref, onUnmounted, shallowRef } from 'vue';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import type { RobotState, Transaction, Insight, PreviewData, AgentId } from '../types';
import { createPCMBlob, decodeAudioData, decodeFromBase64 } from '../utils/audioUtils';
import { useBoardroom } from './useBoardroom';
import { useAgents } from './useAgents';

// Global State
export const useAIAssistantState = () => {
  const robotState = useState<RobotState>('robot-state', () => 'idle');
  const transactions = useState<Transaction[]>('transactions', () => []);
  const insights = useState<Insight[]>('insights', () => []);
  const previewData = useState<PreviewData | null>('preview-data', () => null);
  const error = useState<string | null>('ai-error', () => null);
  // Which agent's persona currently owns the live voice session. The
  // "chair" is the original Co-Founder; specialists take over when their
  // robot is tapped on the chat page.
  const activeAgent = useState<AgentId>('active-agent', () => 'chair');

  // Helper to refresh data from server
  const refreshData = async () => {
    const { data: stats } = await useFetch('/api/dashboard/stats');
    const { data: txs } = await useFetch('/api/transactions?limit=20');
    const { data: insts } = await useFetch('/api/insights');

    if (txs.value) transactions.value = txs.value as any;
    if (insts.value) insights.value = insts.value as any;
  };

  return { robotState, transactions, insights, previewData, error, activeAgent, refreshData };
};

export const useAIAssistant = () => {
  const { robotState, transactions, insights, previewData, error, activeAgent, refreshData } = useAIAssistantState();
  const boardroom = useBoardroom();
  const { getAgent } = useAgents();

  const config = useRuntimeConfig();
  const API_KEY = config.public.geminiApiKey || config.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY;

  // Audio & Connection Refs
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
      try { source.stop(); } catch (e) {}
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

  // Tool definitions split by which agent should have access. Chair has the
  // full set (it captures, saves, convenes). Specialists are read-only — they
  // can look up business data and search the market, but cannot mutate state.
  const TOOL_GET_SUMMARY = {
    name: 'get_business_summary',
    description: 'Get current real-time financial stats (revenue, expenses, profit).',
  };
  const TOOL_SEARCH_TRENDS = {
    name: 'search_market_trends',
    description: 'Search for industry trends, competitor data, or market news.',
    parameters: {
      type: 'OBJECT' as any,
      properties: { query: { type: 'STRING' as any } },
      required: ['query'],
    },
  };
  const CHAIR_ONLY_TOOLS = [
    {
      name: 'extract_business_event',
      description: 'Extracts revenues and expenses from user speech for preview.',
      parameters: {
        type: 'OBJECT' as any,
        properties: {
          revenues: {
            type: 'ARRAY' as any,
            items: {
              type: 'OBJECT' as any,
              properties: {
                amount: { type: 'NUMBER' as any },
                title: { type: 'STRING' as any },
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
                title: { type: 'STRING' as any },
                category: { type: 'STRING' as any },
              },
            },
          },
        },
      },
    },
    {
      name: 'save_insight',
      description: 'Saves a strategic insight to the business dashboard database.',
      parameters: {
        type: 'OBJECT' as any,
        properties: {
          whatHappened: { type: 'STRING' as any },
          whyItMatters: { type: 'STRING' as any },
          whatToDo: { type: 'STRING' as any },
          category: { type: 'STRING' as any },
        },
        required: ['whatHappened', 'whyItMatters', 'whatToDo'],
      },
    },
    {
      name: 'convene_boardroom',
      description:
        'Convenes the specialist board (CFO, CMO, Operator) to debate a strategic decision in front of the user. Use ONLY for strategic decisions — pricing changes, hiring, big spend, supplier change, market entry, etc. Do not use for simple data lookups or transaction capture.',
      parameters: {
        type: 'OBJECT' as any,
        properties: {
          topic: {
            type: 'STRING' as any,
            description:
              'The strategic question or decision in Arabic, written as the user would phrase it (one short sentence).',
          },
          agents: {
            type: 'ARRAY' as any,
            description:
              'Optional explicit subset of agents. Omit to let the server pick by topic. Allowed: cfo, cmo, operator.',
            items: { type: 'STRING' as any },
          },
        },
        required: ['topic'],
      },
    },
  ];

  // Open / close / switch the live voice session.
  // - Called with no arg from the chair button → uses current activeAgent.
  // - Called with an agentId from a specialist tap → switches to that agent.
  // - Called with the same agentId while already active → stops the session.
  const toggleListen = async (asAgent?: AgentId) => {
    const switchingAgents = !!asAgent && asAgent !== activeAgent.value;
    const stoppingSameAgent = isSessionActive.value && (!asAgent || asAgent === activeAgent.value);

    if (stoppingSameAgent) {
      sessionRef.value?.close();
      cleanupConnection();
      return;
    }

    if (switchingAgents && isSessionActive.value) {
      sessionRef.value?.close();
      cleanupConnection();
      // Tiny pause so the audio context fully tears down before we open
      // a new session (otherwise mic/output devices can collide).
      await new Promise((r) => setTimeout(r, 120));
    }

    if (asAgent) activeAgent.value = asAgent;

    try {
      error.value = null;
      if (!API_KEY) throw new Error('API Key is missing.');

      await initializeAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream.value = stream;

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // Resolve voice + persona for whoever is now active.
      const agent = getAgent(activeAgent.value);
      const isChair = activeAgent.value === 'chair';
      const functionDeclarations = isChair
        ? [TOOL_GET_SUMMARY, ...CHAIR_ONLY_TOOLS, TOOL_SEARCH_TRENDS]
        : [TOOL_GET_SUMMARY, TOOL_SEARCH_TRENDS];

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: agent.voicePrompt,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.liveVoice } },
          },
          tools: [{ functionDeclarations }],
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
              if (robotState.value === 'listening' || robotState.value === 'understanding') {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = createPCMBlob(inputData);
                if (sessionRef.value) {
                  try {
                    sessionRef.value.sendRealtimeInput({
                      media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' },
                    });
                  } catch (err) {}
                }
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtx.value!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              robotState.value = 'understanding';
              const calls = message.toolCall.functionCalls ?? [];
              for (const fc of calls) {
                let response: { result: string } = { result: 'Success' };

                if (fc.name === 'get_business_summary') {
                  const stats = await $fetch('/api/dashboard/stats');
                  response = { result: JSON.stringify(stats) };
                } else if (fc.name === 'extract_business_event') {
                  const args = fc.args as any;
                  previewData.value = {
                    revenues: args.revenues || [],
                    expenses: args.expenses || [],
                  };
                  robotState.value = 'preview_ready';
                  response = { result: 'Data extracted and shown to user for confirmation.' };
                } else if (fc.name === 'save_insight') {
                  const args = fc.args as any;
                  await $fetch('/api/insights', { method: 'POST', body: args });
                  await refreshData();
                  response = { result: 'Insight persisted to database.' };
                } else if (fc.name === 'search_market_trends') {
                  const args = fc.args as any;
                  // Simulating a real search for now, could be connected to an actual search API
                  response = { result: `Market search for "${args.query}" suggests increasing demand in the ${args.query} sector with a 15% YoY growth. Competitors are moving towards subscription models.` };
                } else if (fc.name === 'convene_boardroom') {
                  // The chair has decided this question deserves the board.
                  // Open the overlay; agents will fetch their own stances.
                  const args = fc.args as any;
                  const topic = (args?.topic as string) || 'قرار استراتيجي';
                  const requestedAgents = Array.isArray(args?.agents) ? args.agents : undefined;
                  // Fire-and-forget so we can return a response to the model immediately.
                  boardroom.open({ topic, trigger: 'user', agents: requestedAgents });
                  response = {
                    result: `Boardroom convened for topic "${topic}". The board is now debating in front of the user.`,
                  };
                }

                if (fc.id) {
                  sessionRef.value?.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response },
                  });
                }
              }
            }

            // Handle Audio output
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                robotState.value = robotState.value === 'preview_ready' ? 'preview_ready' : 'understanding';
                const buffer = await decodeAudioData(decodeFromBase64(part.inlineData.data), outputAudioCtx.value!, 24000);
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

            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: (e) => {
            console.error('Gemini error:', e);
            error.value = 'Connection error occurred.';
            cleanupConnection();
          },
          onclose: () => cleanupConnection(),
        },
      });

      sessionRef.value = await sessionPromise;
    } catch (err: any) {
      cleanupConnection();
      error.value = err.message || 'Failed to start call';
    }
  };

  const handleConfirmPreview = async () => {
    if (previewData.value) {
      const now = new Date();
      
      for (const r of previewData.value.revenues) {
        await $fetch('/api/transactions', {
          method: 'POST',
          body: { ...r, type: 'revenue', date: now.toISOString() }
        });
      }
      
      for (const e of previewData.value.expenses) {
        await $fetch('/api/transactions', {
          method: 'POST',
          body: { ...e, type: 'expense', date: now.toISOString() }
        });
      }

      await refreshData();
      previewData.value = null;
      robotState.value = 'saved';

      sendTextMessage('I have confirmed and saved everything to the database. Now, give me a quick strategic insight based on these new records.');

      setTimeout(() => { robotState.value = 'listening'; }, 3000);
    }
  };

  const handleCancelPreview = () => {
    previewData.value = null;
    robotState.value = 'listening';
    sendTextMessage("I cancelled the preview.");
  };

  onUnmounted(() => cleanupConnection());

  return {
    robotState, transactions, insights, previewData, error, activeAgent,
    toggleListen, handleConfirmPreview, handleCancelPreview, isSessionActive, refreshData,
  };
};
