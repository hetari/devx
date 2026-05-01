<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

definePageMeta({
  layout: "authenticated",
});

useSeoMeta({
  title: "الإعدادات",
});

const businessName = shallowRef("تجارة شريكك");
const currency = shallowRef("USD");
</script>

<template>
  <div>
    <AppHeader
      title="إعدادات النظام"
      subtitle="اضبط ملف العمل والمعايير التشغيلية."
    />

    <section class="max-w-2xl rounded-md border bg-card p-6 landing-reveal">
      <div class="grid gap-6">
        <label class="grid gap-2">
          <Label class="text-[10px] font-black uppercase tracking-wider">اسم النشاط</Label>
          <Input v-model="businessName" class="rounded-md h-9 text-sm font-medium focus-visible:ring-primary"/>
        </label>
        <label class="grid gap-2">
          <Label class="text-[10px] font-black uppercase tracking-wider">العملة</Label>
          <Input v-model="currency" class="rounded-md h-9 text-sm font-medium focus-visible:ring-primary"/>
        </label>
        <Button class="w-fit h-9 rounded-md text-[10px] font-black uppercase tracking-wider">حفظ الإعدادات</Button>
      </div>
    </section>

    <section class="mt-8 landing-reveal" :style="{ animationDelay: '160ms' }">
      <TrustDial />
    </section>
  </div>
</template>

<style scoped>
.landing-reveal {
  animation: landing-rise 520ms ease-out both;
}

@keyframes landing-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
