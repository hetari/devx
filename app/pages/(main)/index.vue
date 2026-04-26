<script setup lang="ts">
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Lightbulb,
  LockKeyhole,
  Menu,
  Play,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-vue-next";

definePageMeta({
  layout: false,
});

const isSheetOpen = ref(false);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const heroStats = [
  {
    label: "Tracked Revenue",
    value: currencyFormatter.format(2450),
    detail: "+18.2%",
    tone: "text-chart-4",
  },
  {
    label: "Profit Margin",
    value: `${percentFormatter.format(36.3)}%`,
    detail: "+6.3%",
    tone: "text-primary",
  },
  {
    label: "Expenses Found",
    value: currencyFormatter.format(1560),
    detail: "3 fixes",
    tone: "text-destructive",
  },
] as const;

const navLinks = [
  { label: "Product", to: "#product" },
  { label: "Workflows", to: "#workflows" },
  { label: "Insights", to: "#insights" },
  { label: "Pricing", to: "#pricing" },
  { label: "FAQ", to: "#faq" },
] as const;

const operatingLoop = [
  {
    title: "Capture Every Sale",
    copy: "Log revenue, expenses, delivery fees, and supplies before they blur together.",
    icon: ReceiptText,
  },
  {
    title: "Read The Business",
    copy: "Atule turns transactions into cash flow, profit margin, and category pressure.",
    icon: BarChart3,
  },
  {
    title: "Ask For The Next Move",
    copy: "The AI partner explains what changed and which action should happen today.",
    icon: Bot,
  },
] as const;

const featureGrid = [
  {
    title: "Cash Flow That Speaks Plainly",
    copy: "Revenue, expenses, and profit stay in one operating view, with no finance jargon required.",
    icon: Wallet,
  },
  {
    title: "Expense Pressure Radar",
    copy: "Spot materials, delivery, marketing, and utility costs before they drain the month.",
    icon: TrendingDown,
  },
  {
    title: "AI Strategy Briefs",
    copy: "Get practical recommendations based on the numbers already inside your workspace.",
    icon: Lightbulb,
  },
  {
    title: "Export-Ready Reports",
    copy: "Turn messy activity into clean summaries for lenders, partners, and your own review.",
    icon: FileText,
  },
] as const;

const trustItems = [
  "Built for owner-led businesses",
  "Private workspace by default",
  "No spreadsheet cleanup ritual",
] as const;

const faqItems = [
  {
    question: "What is Atule?",
    answer:
      "Atule is an AI business partner that brings your sales, expenses, cash flow, and goals into one calm cockpit—then helps you decide the next step.",
  },
  {
    question: "How does the AI partner work?",
    answer:
      "It reads your transaction history, detects patterns, and provides short, actionable briefs you can act on immediately.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. Your workspace is private by default. No sharing, no public dashboards, and you control exactly what data is stored.",
  },
  {
    question: "Can I start for free?",
    answer:
      "You can explore the live dashboard and learning content right now. When you’re ready, bring in your real numbers—no rushed upgrade required.",
  },
];

useSeoMeta({
  title: "Atule - AI Business Partner",
  description:
    "Atule is an AI business partner for owner-led shops that turns cash flow, expenses, transactions, and goals into clear next actions.",
  ogTitle: "Atule - AI Business Partner",
  ogDescription:
    "Run your sales, expenses, insights, and AI guidance from one calm business cockpit.",
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: { lang: "en" },
});
</script>

<template>
  <div
    class="min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
  >
    <!-- Skip link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      Skip To Main Content
    </a>

    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl"
    >
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          translate="no"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-transform duration-200 group-hover:-rotate-3"
          >
            <Sparkles class="size-4" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-black uppercase">
              Atule
            </span>
            <span
              class="block truncate text-xs font-medium text-muted-foreground"
            >
              AI Business Partner
            </span>
          </span>
        </NuxtLink>

        <!-- Desktop nav links -->
        <div class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Right side (mobile menu, toggle, CTAs) -->
        <div class="flex items-center gap-2">
          <!-- Mobile Sheet -->
          <Sheet v-model:open="isSheetOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden">
                <Menu class="size-5" />
                <span class="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader>
                <SheetTitle>Atule</SheetTitle>
                <SheetDescription>AI Business Partner</SheetDescription>
              </SheetHeader>
              <nav class="mt-6 flex flex-col gap-1">
                <NuxtLink
                  v-for="link in navLinks"
                  :key="link.to"
                  :to="link.to"
                  class="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  @click="isSheetOpen = false"
                >
                  {{ link.label }}
                </NuxtLink>
              </nav>
            </SheetContent>
          </Sheet>

          <ToggleMode />

          <Button as-child variant="ghost" class="hidden h-9 md:inline-flex">
            <NuxtLink to="/chat">Ask AI</NuxtLink>
          </Button>
          <Button as-child class="h-9">
            <NuxtLink to="/dashboard">
              Open Dashboard
              <ArrowRight class="size-4" aria-hidden="true" />
            </NuxtLink>
          </Button>
        </div>
      </nav>
    </header>

    <main id="main-content">
      <!-- Hero -->
      <section
        class="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-16"
      >
        <div
          class="pointer-events-none absolute inset-x-4 top-8 -z-10 h-80 rounded-md bg-gradient-to-br from-primary/12 via-accent/30 to-secondary/40 blur-3xl"
          aria-hidden="true"
        />
        <div class="max-w-3xl">
          <Badge
            class="border-border bg-card text-card-foreground shadow-sm"
            variant="outline"
          >
            <ShieldCheck class="size-3" aria-hidden="true" />
            Owner-Led Finance Without The Fog
          </Badge>

          <h1
            class="mt-6 max-w-4xl text-balance text-5xl font-black leading-[.92] tracking-normal text-foreground sm:text-6xl lg:text-7xl"
          >
            Atule turns daily business chaos into your next best move.
          </h1>
          <p
            class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            A calm AI business partner for small teams that need sales,
            expenses, cash flow, learning, goals, and advice in one place.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as-child size="lg" class="h-12 px-5">
              <NuxtLink to="/dashboard">
                See The Live Dashboard
                <ArrowRight class="size-4" aria-hidden="true" />
              </NuxtLink>
            </Button>
            <Button
              as-child
              size="lg"
              variant="outline"
              class="h-12 bg-background px-5"
            >
              <NuxtLink to="/learn">
                <Play class="size-4" aria-hidden="true" />
                Explore Learning
              </NuxtLink>
            </Button>
          </div>

          <ul
            class="mt-8 grid gap-3 text-sm font-medium text-muted-foreground sm:grid-cols-3"
          >
            <li
              v-for="item in trustItems"
              :key="item"
              class="flex min-w-0 items-center gap-2"
            >
              <CheckCircle2
                class="size-4 shrink-0 text-chart-4"
                aria-hidden="true"
              />
              <span class="min-w-0 text-pretty">{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Dashboard preview -->
        <div
          id="product"
          class="landing-reveal relative min-h-[560px] overflow-hidden rounded-md border bg-primary p-3 shadow-2xl shadow-primary/20"
          role="img"
          aria-label="Atule dashboard showing revenue, profit margin, cash flow, goals, and AI advice."
        >
          <div
            class="grid h-full min-h-[536px] gap-3 rounded-sm bg-background p-3 lg:grid-cols-[1.15fr_.85fr]"
          >
            <div class="grid min-w-0 content-between gap-3">
              <div
                class="rounded-md border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p
                      class="text-xs font-bold uppercase text-muted-foreground"
                    >
                      Today’s Cash Signal
                    </p>
                    <p class="mt-1 truncate text-3xl font-black">
                      {{ currencyFormatter.format(890) }} Profit
                    </p>
                  </div>
                  <span
                    class="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
                  >
                    <TrendingUp class="size-5" aria-hidden="true" />
                  </span>
                </div>
                <div class="mt-5 grid h-44 grid-cols-7 items-end gap-2">
                  <span class="h-[36%] rounded-sm bg-muted" />
                  <span class="h-[54%] rounded-sm bg-secondary" />
                  <span class="h-[42%] rounded-sm bg-muted" />
                  <span class="h-[68%] rounded-sm bg-chart-4" />
                  <span class="h-[62%] rounded-sm bg-secondary" />
                  <span class="h-[78%] rounded-sm bg-primary/70" />
                  <span class="h-[92%] rounded-sm bg-primary" />
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div
                  v-for="stat in heroStats"
                  :key="stat.label"
                  class="rounded-md border bg-card p-4 text-card-foreground shadow-sm"
                >
                  <p class="truncate text-xs font-bold text-muted-foreground">
                    {{ stat.label }}
                  </p>
                  <p class="mt-2 truncate text-2xl font-black">
                    {{ stat.value }}
                  </p>
                  <p :class="['mt-1 text-sm font-bold', stat.tone]">
                    {{ stat.detail }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3">
              <div
                class="rounded-md border border-primary/20 bg-primary p-4 text-primary-foreground"
              >
                <div class="flex items-center gap-2">
                  <Bot class="size-5" aria-hidden="true" />
                  <p class="text-sm font-black">AI Brief Ready</p>
                </div>
                <p class="mt-4 text-pretty text-2xl font-black leading-tight">
                  Expenses are 63% of revenue. Group deliveries and renegotiate
                  materials first.
                </p>
                <NuxtLink
                  to="/chat"
                  class="mt-5 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-3 py-2 text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ask Follow-Up
                  <ArrowRight class="size-4" aria-hidden="true" />
                </NuxtLink>
              </div>

              <div
                class="rounded-md border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-black">Goal Progress</p>
                  <span
                    class="rounded-md bg-muted px-2 py-1 text-xs font-black text-muted-foreground"
                  >
                    Active
                  </span>
                </div>
                <div class="mt-5 space-y-4">
                  <div>
                    <div class="flex justify-between gap-3 text-sm">
                      <span class="font-semibold">Monthly Profit</span>
                      <span class="font-bold">45%</span>
                    </div>
                    <Progress
                      :model-value="45"
                      class="mt-2 h-2 [&>div]:bg-chart-4"
                    />
                  </div>
                  <div>
                    <div class="flex justify-between gap-3 text-sm">
                      <span class="font-semibold">Expense Control</span>
                      <span class="font-bold">30%</span>
                    </div>
                    <Progress
                      :model-value="30"
                      class="mt-2 h-2 [&>div]:bg-destructive"
                    />
                  </div>
                </div>
              </div>

              <div
                class="rounded-md border bg-card p-4 text-card-foreground shadow-sm"
              >
                <p class="text-sm font-black">Next Transactions</p>
                <div class="mt-4 grid gap-3 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">Sold 10 items</span>
                    <span class="font-black text-chart-4">+$100</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">Bought materials</span>
                    <span class="font-black text-destructive">-$60</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">Delivery fee</span>
                    <span class="font-black text-destructive">-$10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats banner -->
      <section class="border-y bg-card" aria-label="Product outcomes">
        <div
          class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8"
        >
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">3</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              Workflows unified: tracking, insight, action.
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">24</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              Transactions become a readable business story.
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">1</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              AI partner focused on the next useful decision.
            </p>
          </div>
        </div>
      </section>

      <!-- Operating Loop -->
      <section
        id="workflows"
        class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div class="max-w-3xl">
          <Badge
            variant="outline"
            class="border-border bg-card text-card-foreground"
          >
            Operating Loop
          </Badge>
          <h2
            class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
          >
            The daily rhythm that keeps a small business honest.
          </h2>
        </div>

        <div class="mt-10 grid gap-4 lg:grid-cols-3">
          <Card
            v-for="(step, index) in operatingLoop"
            :key="step.title"
            class="landing-reveal transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            :style="{ animationDelay: `${index * 90}ms` }"
          >
            <CardHeader>
              <div
                class="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground"
              >
                <component :is="step.icon" class="size-5" aria-hidden="true" />
              </div>
              <CardDescription
                class="mt-4 text-sm font-black uppercase text-muted-foreground"
              >
                Step {{ index + 1 }}
              </CardDescription>
              <CardTitle class="text-2xl font-black">{{
                step.title
              }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-pretty leading-7 text-muted-foreground">
                {{ step.copy }}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Insights & Features -->
      <section id="insights" class="bg-primary text-primary-foreground">
        <div
          class="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8"
        >
          <div>
            <Badge
              variant="outline"
              class="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
            >
              Insight Engine
            </Badge>
            <h2
              class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
            >
              It does more than show numbers. It explains what to do next.
            </h2>
            <p
              class="mt-5 text-pretty text-lg leading-8 text-primary-foreground/75"
            >
              Atule combines your transaction history, category pressure, goals,
              and learning path into short, usable business guidance.
            </p>
            <Button
              as-child
              class="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <NuxtLink to="/insights">
                View Insights
                <ArrowRight class="size-4" aria-hidden="true" />
              </NuxtLink>
            </Button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Card
              v-for="feature in featureGrid"
              :key="feature.title"
              class="border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground"
            >
              <CardHeader>
                <component
                  :is="feature.icon"
                  class="size-6 text-primary-foreground"
                  aria-hidden="true"
                />
                <CardTitle class="text-xl font-black">{{
                  feature.title
                }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-pretty leading-7 text-primary-foreground/75">
                  {{ feature.copy }}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Pricing / Audiences -->
      <section
        id="pricing"
        class="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8"
      >
        <div>
          <Badge
            variant="outline"
            class="border-border bg-card text-card-foreground"
          >
            Built To Start Now
          </Badge>
          <h2
            class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
          >
            A business cockpit without enterprise ceremony.
          </h2>
          <p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
            Use the dashboard today, bring in real transactions when you are
            ready, and keep every recommendation tied to observable business
            behavior.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CircleDollarSign
                class="size-7 text-chart-4"
                aria-hidden="true"
              />
              <CardTitle class="text-2xl font-black">For Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="leading-7 text-muted-foreground">
                Check the pulse of the business before opening the shop, placing
                supplier orders, or spending on promotion.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <LockKeyhole class="size-7 text-destructive" aria-hidden="true" />
              <CardTitle class="text-2xl font-black">For Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="leading-7 text-muted-foreground">
                Keep decisions grounded in clean records, readable reports, and
                clear account context.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- FAQ (new section with Accordion) -->
      <section id="faq" class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          class="border-border bg-card text-card-foreground"
        >
          FAQ
        </Badge>
        <h2
          class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
        >
          Questions you might have before trusting the numbers.
        </h2>
        <Accordion type="single" collapsible class="mt-10 w-full">
          <AccordionItem
            v-for="(item, index) in faqItems"
            :key="index"
            :value="`item-${index}`"
          >
            <AccordionTrigger class="text-left font-semibold">{{
              item.question
            }}</AccordionTrigger>
            <AccordionContent class="text-muted-foreground">{{
              item.answer
            }}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <!-- CTA -->
      <section class="px-4 pb-4 sm:px-6 lg:px-8">
        <div
          class="mx-auto flex max-w-7xl flex-col gap-6 rounded-md bg-primary p-6 text-primary-foreground sm:p-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="max-w-3xl">
            <p class="text-sm font-black uppercase">Ready When You Are</p>
            <h2
              class="mt-3 text-balance text-3xl font-black leading-tight sm:text-5xl"
            >
              Stop guessing where the money went. Start deciding what happens
              next.
            </h2>
          </div>
          <Button
            as-child
            size="lg"
            class="h-12 shrink-0 bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
          >
            <NuxtLink to="/dashboard">
              Launch Atule
              <Zap class="size-4" aria-hidden="true" />
            </NuxtLink>
          </Button>
        </div>
      </section>
    </main>
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

@media (prefers-reduced-motion: reduce) {
  .landing-reveal {
    animation: none;
  }
}
</style>
