<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "Settings",
});

const businessName = shallowRef("Tariq Trading");
const currency = shallowRef("USD");
</script>

<template>
  <div>
    <AppHeader
      title="Settings"
      subtitle="Manage your business profile and preferences."
    />

    <section class="max-w-2xl rounded-md border bg-card p-6">
      <div class="grid gap-5">
        <label class="grid gap-2">
          <Label>Business name</Label>
          <Input v-model="businessName" />
        </label>
        <label class="grid gap-2">
          <Label>Currency</Label>
          <Input v-model="currency" />
        </label>
        <Button class="w-fit">Save Changes</Button>
      </div>
    </section>
  </div>
</template>
