import { ref, computed } from 'vue';
import { useAgents } from './useAgents';
import type { AgentId, AgentStance, BoardroomConveneRequest } from '../types';

// State shared across the app — pinned via useState so the overlay survives
// page-level navigation while a session is active.

export type BoardroomPhase = 'closed' | 'convening' | 'debating' | 'speaking' | 'deciding' | 'closing';

export const useBoardroom = () => {
  const { speakAs, stopSpeaking, convene, decide } = useAgents();

  const phase = useState<BoardroomPhase>('boardroom-phase', () => 'closed');
  const sessionId = useState<string | null>('boardroom-session-id', () => null);
  const topic = useState<string>('boardroom-topic', () => '');
  const stances = useState<AgentStance[]>('boardroom-stances', () => []);
  const currentSpeaker = useState<AgentId | null>('boardroom-speaker', () => null);
  const error = useState<string | null>('boardroom-error', () => null);
  const outcome = useState<string | null>('boardroom-outcome', () => null);

  const isOpen = computed(() => phase.value !== 'closed');

  const reset = () => {
    stopSpeaking();
    phase.value = 'closed';
    sessionId.value = null;
    topic.value = '';
    stances.value = [];
    currentSpeaker.value = null;
    outcome.value = null;
    error.value = null;
  };

  const open = async (req: BoardroomConveneRequest) => {
    try {
      reset();
      phase.value = 'convening';
      topic.value = req.topic;

      const res = await convene(req);
      sessionId.value = res.sessionId;
      topic.value = res.topic;
      stances.value = res.stances;
      phase.value = 'debating';

      // Speak each stance in sequence, lighting up the speaker.
      phase.value = 'speaking';
      for (const stance of res.stances) {
        currentSpeaker.value = stance.agentId;
        // Best-effort: don't block the UI if SpeechSynthesis fails.
        await speakAs(stance.agentId, stance.textArabic);
        // Small gap so debaters don't overlap.
        await new Promise((r) => setTimeout(r, 250));
      }
      currentSpeaker.value = null;
      phase.value = 'deciding';
    } catch (e: any) {
      error.value = e?.message || 'تعذر استدعاء المجلس';
      phase.value = 'closed';
    }
  };

  const submitDecision = async (
    decision: 'approved' | 'override' | 'dismissed',
    payload?: { approvedAgent?: AgentId; overrideText?: string }
  ) => {
    if (!sessionId.value) return;
    try {
      phase.value = 'closing';
      const res = await decide(sessionId.value, decision, payload);
      outcome.value = res.outcomeSummary || null;

      // Linger briefly so the user sees the outcome banner, then close.
      setTimeout(() => reset(), 4000);
    } catch (e: any) {
      error.value = e?.message || 'تعذر حفظ القرار';
    }
  };

  return {
    phase,
    sessionId,
    topic,
    stances,
    currentSpeaker,
    error,
    outcome,
    isOpen,
    open,
    submitDecision,
    reset,
  };
};
