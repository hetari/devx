export type RobotState = 'idle' | 'listening' | 'understanding' | 'preview_ready' | 'saved';

export interface Transaction {
  id: string;
  title: string;
  type: 'revenue' | 'expense';
  amount: number;
  category: string;
  date: string | Date;
  time?: string;
  doc?: string;
}

export interface Insight {
  id: string;
  whatHappened: string;
  whyItMatters: string;
  whatItMeans?: string;
  whatToDo: string;
  timestamp: string | Date;
  category?: string;
}

export interface PreviewData {
  revenues: { title: string; amount: number; category: string }[];
  expenses: { title: string; amount: number; category: string }[];
}

// ----- AI Co-Founder Boardroom -----

export type AgentId = 'chair' | 'cfo' | 'cmo' | 'operator';

export type AgentVisualState = 'idle' | 'listening';

export interface AgentDefinition {
  id: AgentId;
  displayName: string;       // English short name for code/UI
  arabicName: string;        // Arabic display label shown to the user
  domain: string;            // one-line domain description (Arabic)
  bias: string;              // one-line argumentative bias (Arabic)
  liveVoice: string;         // Gemini Live prebuilt voice name
  // Conversational Arabic system prompt used when this agent runs as the
  // active live-voice persona. Distinct from the boardroom JSON-stance
  // prompt: here the agent talks like a human partner, briefly.
  voicePrompt: string;
  asset: {
    idle: string;            // public path to idle image
    listening: string;       // public path to listening image
  };
  // Multiplier applied to the image inside AgentAvatar's bounding box. Each
  // PNG has its own padding/cropping; agents with a tightly cropped subject
  // (lots of transparent padding) want > 1.0 to fill the frame; agents whose
  // PNG already fills the frame want closer to 1.0 (or below). Default 1.0.
  imageScale?: number;
  tint: string;              // tailwind color hint, e.g. "blue", "orange", "stone"
  speech: {
    langCandidates: string[];   // BCP-47 codes to prefer when picking a SpeechSynthesis voice
    voiceNameCandidates: string[]; // case-insensitive substrings to look for in voice.name
    pitch: number;              // 0..2, default 1
    rate: number;               // 0.1..10, default 1
  };
}

export interface AgentStance {
  agentId: AgentId;
  arabicName: string;
  textArabic: string;        // 1-2 sentence opinion
  textEnglish?: string;      // optional translation (debug / future)
  agreesWith?: AgentId[];    // light-weight agreement tagging the orchestrator infers
  disagreesWith?: AgentId[];
  suggestedAction?: {
    label: string;           // short action title
    detail: string;          // 1-line specifics
  };
}

export interface BoardroomConveneRequest {
  topic: string;             // the question or signal driving the meeting
  trigger: 'user' | 'background' | 'scheduled';
  agents?: AgentId[];        // optional explicit list; default = relevant by topic
  context?: Record<string, unknown>;
}

export interface BoardroomConveneResponse {
  sessionId: string;
  topic: string;
  stances: AgentStance[];
}

export interface BoardroomDecision {
  sessionId: string;
  decision: 'approved' | 'override' | 'dismissed';
  approvedAgent?: AgentId;
  overrideText?: string;
}
