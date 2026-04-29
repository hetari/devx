import type { AgentDefinition, AgentId, AgentStance, AgentVisualState, BoardroomConveneRequest, BoardroomConveneResponse } from '../types';

// ---------- Agent registry ----------
// Single source of truth for the cast: chair (already wired to Gemini Live elsewhere)
// plus three specialists who speak via the browser SpeechSynthesis API in the
// Boardroom. System prompts live server-side (see /server/api/boardroom/convene.post.ts);
// what lives here is everything the UI needs.

const AGENT_DEFINITIONS: Record<AgentId, AgentDefinition> = {
  chair: {
    id: 'chair',
    displayName: 'Co-Founder',
    arabicName: 'الشريك المؤسس',
    domain: 'الواجهة الرئيسية، الإنصات، والتلخيص',
    bias: 'يجمع الآراء ويوصل قرار المجلس',
    liveVoice: 'Aoede',
    voicePrompt: `
أنت شريك مؤسس يعمل بالذكاء الاصطناعي (AI Co-Founder).
مهمتك مساعدة رائد الأعمال في إدارة وتنمية شركته من خلال البيانات الحقيقية ومشورة استراتيجية.

كن عملياً ومبادراً، وتحدث دائماً بالعربية وردودك قصيرة وطبيعية كصوت إنسان.

استخدم أدواتك:
- 'extract_business_event' لاستخراج المبيعات والمصاريف من كلام المستخدم.
- 'get_business_summary' لمعرفة الوضع المالي الحالي.
- 'save_insight' لحفظ توصية استراتيجية.
- 'search_market_trends' لبحث اتجاهات السوق.
- 'convene_boardroom' لاستدعاء المجلس عند أي قرار استراتيجي مهم.

عند تأكيد المستخدم على البيانات احفظها فوراً دون تكرار الإذن.
`.trim(),
    asset: {
      idle: '/robot/0.png',
      listening: '/robot/2.png',
    },
    tint: 'blue',
    speech: {
      langCandidates: ['ar-SA', 'ar-EG', 'ar'],
      voiceNameCandidates: ['hoda', 'naayf', 'arabic', 'female'],
      pitch: 1.0,
      rate: 1.0,
    },
  },
  cfo: {
    id: 'cfo',
    displayName: 'CFO',
    arabicName: 'المدير المالي',
    domain: 'النقد، الهامش، الفترة المتبقية، الذمم المدينة، الضرائب',
    bias: 'كل صرف يجب أن يبرر نفسه',
    liveVoice: 'Charon',
    voicePrompt: `
أنت "المدير المالي" (CFO) في الفريق المؤسس. شخصيتك هادئة، تحليلية، متشككة بشكل لطيف.
انحيازك الدائم: أي صرف يجب أن يبرر نفسه، وحماية النقد قبل كل شيء.
مجالك: النقد، الهامش، الفترة النقدية المتبقية، الذمم المدينة المتأخرة، الضرائب.

تحدث بالعربية، وبصوت إنسان حقيقي على طاولة الإدارة. ردودك قصيرة جداً (جملة أو جملتان).
لا تشرح "كمدير مالي أنا..." بل تحدث مباشرة. استند إلى الأرقام.

استخدم 'get_business_summary' لقراءة الأرقام الحقيقية للشركة قبل الرد.
إذا طُرح موضوع خارج اختصاصك (تسويق، عمليات)، اقترح على المستخدم سؤال الزميل المختص.
لا تستخرج معاملات ولا تحفظ insights — هذه مهمة الشريك المؤسس.
`.trim(),
    asset: {
      idle: '/agents/cfo-idle.png',
      listening: '/agents/cfo-listening.png',
    },
    imageScale: 1.22,   // CFO PNG has lots of transparent padding; bump up
    tint: 'sky',
    speech: {
      langCandidates: ['ar-SA', 'ar-EG', 'ar'],
      voiceNameCandidates: ['naayf', 'male', 'arabic'],
      pitch: 0.85,
      rate: 0.95,
    },
  },
  cmo: {
    id: 'cmo',
    displayName: 'CMO',
    arabicName: 'مدير التسويق',
    domain: 'التسويق، العلامة، التسعير، النمو',
    bias: 'استثمر الآن، استرد لاحقاً',
    liveVoice: 'Puck',
    voicePrompt: `
أنت "مدير التسويق" (CMO) في الفريق المؤسس. شخصيتك متفائلة، حماسية، ترى الفرص في كل مكان.
انحيازك الدائم: استثمر الآن، استرد لاحقاً. لا تخف من المخاطرة المحسوبة على النمو.
مجالك: التسويق، العلامة التجارية، التسعير، اكتساب العملاء.

تحدث بالعربية، بصوت إنسان حقيقي وحماسي. ردودك قصيرة (جملة أو جملتان).
ربط أفكارك بالعميل والسوق، لا بالأرقام الباردة فقط.

استخدم 'get_business_summary' لقراءة الأرقام الحقيقية قبل الرد.
'search_market_trends' للبحث عن السوق والمنافسين.
إذا طُرح موضوع خارج اختصاصك (مالي، عمليات)، اقترح على المستخدم سؤال الزميل المختص.
لا تستخرج معاملات ولا تحفظ insights — هذه مهمة الشريك المؤسس.
`.trim(),
    asset: {
      idle: '/agents/cmo-idle.png',
      listening: '/agents/cmo-listening.png',
    },
    imageScale: 0.9,    // CMO PNG already fills its frame; pull it in
    tint: 'orange',
    speech: {
      langCandidates: ['ar-SA', 'ar-EG', 'ar'],
      voiceNameCandidates: ['hoda', 'female', 'arabic'],
      pitch: 1.15,
      rate: 1.1,
    },
  },
  operator: {
    id: 'operator',
    displayName: 'Operator',
    arabicName: 'مدير العمليات',
    domain: 'المخزون، الموردون، التسليم، العمليات',
    bias: 'لا تكسر ما يعمل',
    liveVoice: 'Fenrir',
    voicePrompt: `
أنت "مدير العمليات" (COO) في الفريق المؤسس. شخصيتك عملية، حازمة، لا تحب المخاطرة غير المحسوبة.
انحيازك الدائم: لا تكسر ما يعمل، والتنفيذ قبل الفكرة.
مجالك: المخزون، الموردون، الجودة، التسليم، العمليات اليومية.

تحدث بالعربية، بصوت إنسان حقيقي عملي ومباشر. ردودك قصيرة (جملة أو جملتان).
ركز على الواقع التشغيلي، الطاقة، والمخاطر.

استخدم 'get_business_summary' لقراءة الأرقام الحقيقية قبل الرد.
إذا طُرح موضوع خارج اختصاصك (مالي، تسويق)، اقترح على المستخدم سؤال الزميل المختص.
لا تستخرج معاملات ولا تحفظ insights — هذه مهمة الشريك المؤسس.
`.trim(),
    asset: {
      idle: '/agents/operator-idle.png',
      listening: '/agents/operator-listening.png',
    },
    imageScale: 0.9,    // Operator PNG already fills its frame; pull it in
    tint: 'stone',
    speech: {
      langCandidates: ['ar-SA', 'ar-EG', 'ar'],
      voiceNameCandidates: ['naayf', 'male', 'arabic'],
      pitch: 0.95,
      rate: 0.92,
    },
  },
};

// Specialists that participate in Boardroom debates.
const SPECIALIST_IDS: AgentId[] = ['cfo', 'cmo', 'operator'];

// ---------- SpeechSynthesis voice resolution ----------

const voiceCache = new Map<AgentId, SpeechSynthesisVoice | null>();

function resolveVoiceFor(agent: AgentDefinition): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  if (voiceCache.has(agent.id)) return voiceCache.get(agent.id) ?? null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return null; // browser hasn't loaded them yet
  }

  // 1. exact name-substring match within preferred languages
  for (const lang of agent.speech.langCandidates) {
    const langMatches = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    for (const namePart of agent.speech.voiceNameCandidates) {
      const hit = langMatches.find((v) => v.name.toLowerCase().includes(namePart.toLowerCase()));
      if (hit) {
        voiceCache.set(agent.id, hit);
        return hit;
      }
    }
    if (langMatches.length) {
      // 2. any voice in the preferred language
      const fallback = langMatches[0];
      if (fallback) {
        voiceCache.set(agent.id, fallback);
        return fallback;
      }
    }
  }

  // 3. give up, let browser pick default
  voiceCache.set(agent.id, null);
  return null;
}

// ---------- Composable ----------

export const useAgents = () => {
  const agents = AGENT_DEFINITIONS;

  // Ensure voices list is populated. Many browsers fire a 'voiceschanged' event
  // and the cache must be reset when that happens.
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    if (!('__agentVoicesBound' in window)) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        voiceCache.clear();
      });
      Object.defineProperty(window, '__agentVoicesBound', { value: true });
    }
  }

  const getAgent = (id: AgentId): AgentDefinition => agents[id];

  const getSpecialists = (): AgentDefinition[] =>
    SPECIALIST_IDS.map((id) => agents[id]);

  const assetFor = (id: AgentId, state: AgentVisualState): string => {
    const agent = agents[id];
    return agent.asset[state] || agent.asset.idle;
  };

  // Speak a piece of text in this agent's voice using browser SpeechSynthesis.
  // Returns a promise that resolves when speech ends (or immediately if unsupported).
  const speakAs = (id: AgentId, text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      const agent = agents[id];
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = resolveVoiceFor(agent);
      if (voice) utterance.voice = voice;
      utterance.lang = agent.speech.langCandidates[0] || 'ar-SA';
      utterance.pitch = agent.speech.pitch;
      utterance.rate = agent.speech.rate;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Request a Boardroom convening from the server orchestrator.
  const convene = async (req: BoardroomConveneRequest): Promise<BoardroomConveneResponse> => {
    return await $fetch<BoardroomConveneResponse>('/api/boardroom/convene', {
      method: 'POST',
      body: req,
    });
  };

  // Decide on a Boardroom session.
  const decide = async (
    sessionId: string,
    decision: 'approved' | 'override' | 'dismissed',
    payload?: { approvedAgent?: AgentId; overrideText?: string }
  ): Promise<{ ok: true; outcomeSummary?: string }> => {
    return await $fetch('/api/boardroom/decide', {
      method: 'POST',
      body: { sessionId, decision, ...payload },
    });
  };

  return {
    agents,
    specialistIds: SPECIALIST_IDS,
    getAgent,
    getSpecialists,
    assetFor,
    speakAs,
    stopSpeaking,
    convene,
    decide,
  };
};

export type UseAgentsReturn = ReturnType<typeof useAgents>;
