<script setup lang="ts">
import { Mic, MicOff, Loader2, Volume2 } from "lucide-vue-next";
import { useSpeechRecognition, useSpeechSynthesis } from "@vueuse/core";

const {
  isSupported: isRecognitionSupported,
  isListening,
  result,
  start,
  stop,
} = useSpeechRecognition({
  lang: "en-US",
  interimResults: true,
  continuous: false,
});

const speechContent = ref("");
const isProcessing = ref(false);
const {
  speak,
  stop: stopSpeaking,
  isPlaying,
} = useSpeechSynthesis(speechContent, {
  lang: "en-US",
  pitch: 1,
  rate: 1,
});

const toggleListening = () => {
  if (isListening.value) {
    stop();
  } else {
    stopSpeaking();
    result.value = "";
    start();
  }
};

watch(result, async (newVal) => {
  if (!isListening.value && newVal) {
    await processVoiceCommand(newVal);
  }
});

// Fallback for when recognition stops naturally
watch(isListening, async (listening) => {
  if (!listening && result.value && !isProcessing.value) {
    await processVoiceCommand(result.value);
  }
});

const processVoiceCommand = async (command: string) => {
  if (!command.trim()) return;

  isProcessing.value = true;
  try {
    const { data, error } = await useFetch("/api/gemini/voice", {
      method: "POST",
      body: { prompt: command },
    });

    if (error.value) throw error.value;

    if (data.value?.text) {
      speechContent.value = data.value.text;
      speak();
    }
  } catch (err) {
    console.error("Error processing voice command:", err);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
    <!-- Transcription Bubble -->
    <Transition
      enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-300"
      leave-active-class="animate-out fade-out slide-in-from-bottom-4 duration-300"
    >
      <div
        v-if="isListening || isProcessing || isPlaying || result"
        class="max-w-xs rounded-2xl border border-white/20 bg-background/80 p-4 shadow-xl backdrop-blur-xl md:max-w-md"
      >
        <div class="flex items-center gap-2 mb-2">
          <div v-if="isListening" class="flex gap-1">
            <span class="size-1.5 animate-bounce rounded-full bg-primary" />
            <span
              class="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]"
            />
            <span
              class="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]"
            />
          </div>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{
              isListening
                ? "Listening..."
                : isProcessing
                  ? "Thinking..."
                  : isPlaying
                    ? "Gemini Speaking"
                    : "Last Command"
            }}
          </span>
        </div>

        <p class="text-sm font-medium leading-relaxed">
          {{
            isListening
              ? result || "Say something..."
              : isProcessing
                ? "Analyzing your request..."
                : isPlaying
                  ? speechContent
                  : result
          }}
        </p>
      </div>
    </Transition>

    <!-- Main Button -->
    <button
      class="group relative flex size-14 items-center justify-center rounded-full border border-white/20 bg-primary shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      :disabled="!isRecognitionSupported"
      :aria-label="isListening ? 'Stop Listening' : 'Start Voice Assistant'"
      @click="toggleListening"
    >
      <!-- Pulse Rings -->
      <span
        v-if="isListening"
        class="absolute inset-0 animate-ping rounded-full bg-primary/40"
      />
      <span
        v-if="isListening"
        class="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-delay:0.5s]"
      />

      <!-- Icons -->
      <Loader2
        v-if="isProcessing"
        class="size-6 animate-spin text-primary-foreground"
      />
      <Volume2
        v-else-if="isPlaying"
        class="size-6 text-primary-foreground"
        @click.stop="stopSpeaking"
      />
      <Mic
        v-else-if="!isListening"
        class="size-6 text-primary-foreground transition-transform group-hover:scale-110"
      />
      <MicOff v-else class="size-6 text-primary-foreground" />

      <!-- Tooltip (Desktop) -->
      <span
        class="absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-bold text-background group-hover:block"
      >
        {{ isListening ? "Stop" : isPlaying ? "Mute" : "Ask Gemini" }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
</style>
