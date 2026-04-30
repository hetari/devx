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
  // Hidden HTMLAudioElement that actually drives the OS speaker. We pipe
  // WebAudio output into a MediaStream and play it here instead of going
  // straight to AudioContext.destination — this keeps playback on the OS
  // default media output device even when getUserMedia is holding a mic
  // on a *different* device. Without this, Chrome on Windows routes the
  // AudioContext destination to whatever device owns the mic, which is
  // why audio was only audible when the BT Hands-Free profile was the
  // default (it's a single duplex device, so mic and speaker matched).
  const outputAudioEl = shallowRef<HTMLAudioElement | null>(null);
  const nextStartTime = ref<number>(0);
  const sources = shallowRef<Set<AudioBufferSourceNode>>(new Set());
  const activeStream = shallowRef<MediaStream | null>(null);
  const sessionRef = shallowRef<any>(null);
  const inputSource = shallowRef<MediaStreamAudioSourceNode | null>(null);
  const inputProcessor = shallowRef<ScriptProcessorNode | null>(null);
  const isSessionActive = ref(false);

  const initializeAudio = async () => {
    if (!inputAudioCtx.value) {
      // latencyHint 'interactive' keeps mic capture responsive.
      inputAudioCtx.value = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive',
      });
    }
    if (!outputAudioCtx.value) {
      // latencyHint 'playback' tells the OS this context is for output and
      // should not be ducked by echo-cancellation pipelines.
      outputAudioCtx.value = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'playback',
      });
      outputNode.value = outputAudioCtx.value.createGain();

      // Route output through a MediaStreamDestination + HTMLAudioElement
      // instead of AudioContext.destination. The audio element gets played
      // through the OS default media output (speakers / Stereo BT / etc.)
      // independently of whichever device the mic capture is using. This
      // is what frees Windows users from having to set the BT Hands-Free
      // profile as default just to hear the agent.
      const streamDest = outputAudioCtx.value.createMediaStreamDestination();
      outputNode.value.connect(streamDest);

      const el = new Audio();
      el.autoplay = true;
      el.srcObject = streamDest.stream;
      // Some Chrome builds need an explicit play() after srcObject is set;
      // failures are swallowed because autoplay handles the typical case.
      el.play().catch(() => {});
      outputAudioEl.value = el;
    }
    // Resume contexts in case the browser auto-suspended them (Chrome will do
    // this if the page hasn't had a recent user gesture).
    if (inputAudioCtx.value.state === 'suspended') await inputAudioCtx.value.resume();
    if (outputAudioCtx.value.state === 'suspended') await outputAudioCtx.value.resume();
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
  // full set (it captures, saves, convenes, navigates, runs night-shift,
  // generates briefings). Specialists share the read-only data tools so
  // they can answer questions about real numbers but cannot mutate state.
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
  // Lists recent transactions. All agents may call this.
  const TOOL_LIST_TRANSACTIONS = {
    name: 'list_transactions',
    description:
      'List recent transactions (revenues and expenses). Use to answer questions about specific sales, spending categories, or recent activity.',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        limit: { type: 'NUMBER' as any, description: 'Max transactions to return. Default 10, max 50.' },
        type: { type: 'STRING' as any, description: 'Filter by type: "revenue" or "expense". Omit for both.' },
      },
    },
  };
  // Lists recent insights. All agents may call this.
  const TOOL_LIST_INSIGHTS = {
    name: 'list_insights',
    description:
      'List the most recent strategic insights saved to the business. Use when the user asks "what did we decide" or "what was your last advice".',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        limit: { type: 'NUMBER' as any, description: 'Max insights to return. Default 5, max 20.' },
      },
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
    {
      name: 'navigate_to',
      description:
        "Navigates the user to a different page in the app. Use when the user asks to see something specific (e.g. 'show me the dashboard', 'open transactions', 'go to settings').",
      parameters: {
        type: 'OBJECT' as any,
        properties: {
          page: {
            type: 'STRING' as any,
            description:
              "Page id. One of: 'dashboard', 'transactions', 'goals', 'insights', 'settings', 'reports', 'learn', 'chat'.",
          },
        },
        required: ['page'],
      },
    },
    {
      name: 'run_night_shift_now',
      description:
        'Triggers the Night Shift loop immediately so each specialist agent reviews the business and produces fresh background events (drafts, alerts, briefs). Use when the user asks the agents to "run a check", "see what you find", or wants the dashboard feed refreshed.',
    },
    {
      name: 'generate_weekly_briefing',
      description:
        'Opens the weekly board-style briefing as a printable report in a new tab. Use when the user asks for "the weekly report", "Friday briefing", or wants to see a summary they can print or share.',
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
      // Explicitly disable browser DSP on the mic input. Default audio:true
      // turns on echoCancellation/noiseSuppression/autoGainControl, which
      // makes Chrome's echo-canceller silence speaker playback while the
      // mic is hot — that's why voices were only audible through headsets.
      // Trade-off: with loud speakers the agent may pick up its own voice;
      // recommend modest volume or use headphones in noisy rooms.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      activeStream.value = stream;

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // Resolve voice + persona for whoever is now active.
      const agent = getAgent(activeAgent.value);
      const isChair = activeAgent.value === 'chair';
      const functionDeclarations = isChair
        ? [
            TOOL_GET_SUMMARY,
            TOOL_LIST_TRANSACTIONS,
            TOOL_LIST_INSIGHTS,
            ...CHAIR_ONLY_TOOLS,
            TOOL_SEARCH_TRENDS,
          ]
        : [TOOL_GET_SUMMARY, TOOL_LIST_TRANSACTIONS, TOOL_LIST_INSIGHTS, TOOL_SEARCH_TRENDS];

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
                } else if (fc.name === 'list_transactions') {
                  const args = fc.args as any;
                  const limit = Math.min(Math.max(Number(args?.limit) || 10, 1), 50);
                  const params = new URLSearchParams({ limit: String(limit) });
                  if (args?.type === 'revenue' || args?.type === 'expense') {
                    params.set('type', args.type);
                  }
                  try {
                    const txs = await $fetch(`/api/transactions?${params.toString()}`);
                    response = { result: JSON.stringify(txs) };
                  } catch (err: any) {
                    response = { result: `Could not load transactions: ${err?.message ?? 'unknown'}` };
                  }
                } else if (fc.name === 'list_insights') {
                  const args = fc.args as any;
                  const limit = Math.min(Math.max(Number(args?.limit) || 5, 1), 20);
                  try {
                    const insts = await $fetch(`/api/insights?limit=${limit}`);
                    response = { result: JSON.stringify(insts) };
                  } catch (err: any) {
                    response = { result: `Could not load insights: ${err?.message ?? 'unknown'}` };
                  }
                } else if (fc.name === 'navigate_to') {
                  // Push to the page the user asked for. We reject unknown
                  // page ids rather than crash on a bad route.
                  const args = fc.args as any;
                  const allowed: Record<string, string> = {
                    dashboard: '/dashboard',
                    transactions: '/transactions',
                    goals: '/goals',
                    insights: '/insights',
                    settings: '/settings',
                    reports: '/reports',
                    learn: '/learn',
                    chat: '/chat',
                  };
                  const target = allowed[String(args?.page ?? '').toLowerCase()];
                  if (!target) {
                    response = { result: `Unknown page "${args?.page}". Allowed: ${Object.keys(allowed).join(', ')}.` };
                  } else {
                    try {
                      const router = useRouter();
                      await router.push(target);
                      response = { result: `Navigated to ${target}.` };
                    } catch (err: any) {
                      response = { result: `Navigation failed: ${err?.message ?? 'unknown'}` };
                    }
                  }
                } else if (fc.name === 'run_night_shift_now') {
                  // Trigger one tick of the night-shift loop. Each specialist
                  // agent reviews the snapshot and emits 0-3 BackgroundEvents.
                  try {
                    const result = await $fetch('/api/night-shift/tick', { method: 'POST', body: {} });
                    response = { result: JSON.stringify(result) };
                  } catch (err: any) {
                    response = { result: `Night shift run failed: ${err?.message ?? 'unknown'}` };
                  }
                } else if (fc.name === 'generate_weekly_briefing') {
                  // Open the printable HTML briefing in a new tab so the user
                  // can review/print/save as PDF.
                  if (typeof window !== 'undefined') {
                    window.open('/api/briefings/weekly', '_blank', 'noopener');
                    response = { result: 'Weekly briefing opened in a new tab.' };
                  } else {
                    response = { result: 'Briefing endpoint is at /api/briefings/weekly.' };
                  }
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
      // Use the extracted date if valid, otherwise fallback to now
      const confirmedDate = previewData.value.date || now.toISOString();
      
      // Save all extracted transactions
      for (const r of previewData.value.revenues) {
        await $fetch('/api/transactions', {
          method: 'POST',
          body: { ...r, type: 'revenue', date: confirmedDate }
        });
      }
      
      for (const e of previewData.value.expenses) {
        await $fetch('/api/transactions', {
          method: 'POST',
          body: { ...e, type: 'expense', date: confirmedDate }
        });
      }

      // If there's an AI summary from OCR, save it as an Insight
      if (previewData.value.summary) {
        await $fetch('/api/insights', {
          method: 'POST',
          body: {
            whatHappened: previewData.value.summary,
            whyItMatters: 'تم استخراج هذه المعلومة آلياً من المستند المرفق.',
            whatToDo: 'راجع هذه البيانات في سجل المعاملات للتأكد من دقتها.',
            category: 'OCR',
            timestamp: confirmedDate
          }
        });
      }

      await refreshData();
      const hasData = previewData.value.revenues.length > 0 || previewData.value.expenses.length > 0;
      previewData.value = null;
      robotState.value = 'saved';

      if (hasData) {
        sendTextMessage('I have confirmed and saved everything to the database. Now, give me a quick strategic insight based on these new records.');
      } else {
        sendTextMessage('I have cleared the preview.');
      }

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
