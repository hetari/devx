<script setup lang="ts">
import { computed } from 'vue';
import { useAgents } from '~/composables/useAgents';
import type { AgentId, AgentVisualState } from '~/types';

interface Props {
  agent: AgentId;
  state?: AgentVisualState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speaking?: boolean;
  showLabel?: boolean;
  // Floating bob animation, matches the chair robot. On by default; turn off
  // for crowded layouts (e.g. the night-shift feed list) where motion is noise.
  floating?: boolean;
  // When true, the avatar wraps in a button and emits a click event. Used on
  // the chat page so specialists feel like the chair — tap to address one.
  clickable?: boolean;
  // Toggles a "you've selected me" highlight ring. Independent of speaking.
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  state: 'idle',
  size: 'md',
  speaking: false,
  showLabel: true,
  floating: true,
  clickable: false,
  selected: false,
});

const emit = defineEmits<{ click: [agent: AgentId] }>();

const { getAgent, assetFor } = useAgents();
const agent = computed(() => getAgent(props.agent));
const imgSrc = computed(() => assetFor(props.agent, props.state));

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'size-20 md:size-24';
    case 'lg': return 'size-48 md:size-56 lg:size-64';
    case 'xl': return 'size-40 md:size-48 lg:size-52';   // matches chair compact, fits 4-up in one row without scroll
    default:   return 'size-32 md:size-40';
  }
});

const tintGlow = computed(() => {
  // Tailwind safelist hint — keep these literal so the JIT picks them up.
  const map: Record<string, string> = {
    blue:   'bg-blue-500/40',
    sky:    'bg-sky-500/40',
    orange: 'bg-orange-500/40',
    stone:  'bg-stone-400/40',
    green:  'bg-green-500/40',
    purple: 'bg-purple-500/40',
  };
  return map[agent.value.tint] || 'bg-primary/40';
});

const tintRing = computed(() => {
  const map: Record<string, string> = {
    blue:   'ring-blue-400/60',
    sky:    'ring-sky-400/60',
    orange: 'ring-orange-400/60',
    stone:  'ring-stone-400/60',
    green:  'ring-green-400/60',
    purple: 'ring-purple-400/60',
  };
  return map[agent.value.tint] || 'ring-primary/60';
});
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    :class="[
      'flex flex-col items-center gap-2 select-none',
      clickable ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-2xl' : ''
    ]"
    :aria-pressed="clickable ? selected : undefined"
    @click="clickable && emit('click', props.agent)"
  >
    <div
      :class="[
        'relative flex items-center justify-center',
        sizeClass,
        floating ? 'agent-float' : '',
        selected ? 'ring-4 ring-white/40 rounded-full' : ''
      ]"
    >
      <!-- Glow halo, intensifies when listening or speaking -->
      <div
        class="absolute inset-0 rounded-full blur-2xl transition-all duration-500"
        :class="[
          tintGlow,
          (state === 'listening' || speaking) ? 'scale-110 opacity-90 animate-pulse' : 'scale-90 opacity-50'
        ]"
      />

      <!-- Soft ring shown while speaking to mark active speaker -->
      <div
        v-if="speaking"
        class="absolute inset-0 rounded-full ring-4 animate-pulse"
        :class="tintRing"
      />

      <!-- The two state images stacked, fade between them.
           Per-agent imageScale compensates for each PNG's own padding —
           tightly cropped robots (CFO) need >1.0 to fill the frame, robots
           whose PNG already fills the frame (CMO, Operator) want <1.0 to
           pull in and match. Falls back to 1.0 when no scale is configured. -->
      <div
        class="relative size-full pointer-events-none"
        :style="{ transform: `scale(${agent.imageScale ?? 1})` }"
      >
        <img
          :src="agent.asset.idle"
          :alt="`${agent.displayName} idle`"
          class="absolute inset-0 size-full object-contain transition-opacity duration-300 drop-shadow-2xl"
          :class="state === 'idle' && !speaking ? 'opacity-100' : 'opacity-0'"
          @error="(ev) => ((ev.target as HTMLImageElement).style.opacity = '0')"
        >
        <img
          :src="agent.asset.listening"
          :alt="`${agent.displayName} active`"
          class="absolute inset-0 size-full object-contain transition-opacity duration-300 drop-shadow-2xl"
          :class="(state === 'listening' || speaking) ? 'opacity-100' : 'opacity-0'"
          @error="(ev) => ((ev.target as HTMLImageElement).style.opacity = '0')"
        >
      </div>
    </div>

    <div v-if="showLabel" class="text-center">
      <div class="text-sm font-bold leading-tight">{{ agent.arabicName }}</div>
      <div class="text-[10px] uppercase tracking-wider opacity-60">{{ agent.displayName }}</div>
    </div>
  </component>
</template>

<style scoped>
@keyframes agent-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-16px); }
}

.agent-float {
  animation: agent-float 4s ease-in-out infinite;
}
</style>
