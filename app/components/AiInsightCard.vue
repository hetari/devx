<script setup lang="ts">
import { ArrowRight, Bot, Sparkles, TriangleAlert } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
</script>

<template>
  <Card
    class="grid gap-0 overflow-hidden rounded-md border-primary/30 p-0 lg:grid-cols-[1fr_24rem]"
  >
    <CardContent class="p-6 sm:p-8">
      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="gap-1.5">
          <Sparkles class="size-3.5" />
          رؤية ذكية
        </Badge>
        <Badge>جديد</Badge>
      </div>
      <div class="mt-6 flex gap-4">
        <ToneIcon
          :icon="TriangleAlert"
          tone="danger"
          class="size-14 rounded-full"
        />
        <div>
          <h2
            class="max-w-2xl text-2xl font-semibold tracking-normal sm:text-3xl"
          >
            مصروفاتك تمثل <span class="text-destructive">63%</span> من
            إيراداتك.
          </h2>
          <p class="mt-3 max-w-2xl leading-7 text-muted-foreground">
            هذا أعلى من المعدل المناسب ويقلل من ربحك. أكبر ضغط يأتي من المواد
            وتكاليف التوصيل.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <Button as-child>
              <NuxtLink to="/chat">
                <Sparkles class="size-4" />
                اسأل شريكك
              </NuxtLink>
            </Button>
            <Button as-child variant="outline">
              <NuxtLink to="/insights">
                عرض التفاصيل
                <ArrowRight class="size-4" />
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
    <div class="relative hidden min-h-64 border-l bg-muted/30 lg:block">
      <Card
        class="absolute start-8 top-8 h-28 w-44 rounded-md bg-background/80 p-4 shadow-sm"
      >
        <div
          class="size-16 rounded-full border-[14px] border-primary border-r-destructive"
        />
        <span
          class="absolute end-4 top-8 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground"
          >63%</span
        >
      </Card>
      <Card
        class="absolute bottom-8 start-12 flex h-24 w-36 flex-row items-end gap-2 rounded-md bg-background/80 p-4 shadow-sm"
      >
        <span class="h-8 flex-1 rounded-t bg-primary/40" />
        <span class="h-12 flex-1 rounded-t bg-primary/55" />
        <span class="h-16 flex-1 rounded-t bg-primary/70" />
        <span class="h-20 flex-1 rounded-t bg-primary" />
      </Card>
      <div
        class="absolute bottom-8 end-10 grid size-36 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Bot class="size-20" />
      </div>
    </div>
  </Card>
</template>
