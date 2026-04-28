<script setup lang="ts">
import { Bot, Settings } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "AI Co-Founder Room",
});
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader
      title="CO-FOUNDER MEETING ROOM"
      subtitle="Face-to-face strategy and operational synchronization."
    >
      <Button variant="outline" class="h-9 rounded-md text-[10px] font-black uppercase tracking-wider">
        <Settings class="size-4" />
        AI SETTINGS
      </Button>
    </AppHeader>

    <div class="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm mt-4 p-8 meeting-room-bg">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div class="relative z-10 w-full max-w-4xl flex flex-col items-center gap-4">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Connection Active
          </div>
          <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Your AI Partner</h2>
          <p class="text-muted-foreground font-medium mt-2">Speak naturally to discuss your business state, records, or goals.</p>
        </div>

        <!-- The Large Assistant -->
        <VoiceAssistant />

        <div class="mt-8 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span class="px-4 py-2 border rounded-full">REAL-TIME VOICE API</span>
          <span class="px-4 py-2 border rounded-full">BUSINESS EXTRACTION</span>
          <span class="px-4 py-2 border rounded-full">GLOBAL STATE SYNC</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meeting-room-bg {
  background-image: 
    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
  background-size: 40px 40px;
}
</style>
