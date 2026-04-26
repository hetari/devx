<script setup lang="ts">
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Goals",
});
</script>

<template>
  <div>
    <AppHeader
      title="Goals"
      subtitle="Track targets that keep the business moving."
    >
      <Button>New Goal</Button>
    </AppHeader>

    <section class="grid gap-4 xl:grid-cols-2">
      <GoalsCard />
      <AssistantCard />
    </section>
  </div>
</template>
