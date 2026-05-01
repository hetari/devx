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
    label: "الإيرادات المتتبعة",
    value: currencyFormatter.format(2450),
    detail: "+18.2%",
    tone: "text-chart-4",
  },
  {
    label: "هامش الربح",
    value: `${percentFormatter.format(36.3)}%`,
    detail: "+6.3%",
    tone: "text-primary",
  },
  {
    label: "المصروفات المكتشفة",
    value: currencyFormatter.format(1560),
    detail: "3 fixes",
    tone: "text-destructive",
  },
] as const;

const navLinks = [
  { label: "المنتج", to: "#product" },
  { label: "العمليات", to: "#workflows" },
  { label: "الرؤى", to: "#insights" },
  { label: "التسعير", to: "#pricing" },
  { label: "الأسئلة الشائعة", to: "#faq" },
] as const;

const operatingLoop = [
  {
    title: "التقط كل عملية بيع",
    copy: "سجّل الإيرادات والمصروفات ورسوم التوصيل والمستلزمات قبل أن تختلط.",
    icon: ReceiptText,
  },
  {
    title: "اقرأ العمل",
    copy: "شريكك يحول المعاملات إلى تدفق نقدي وهامش ربح وضغط على الفئات.",
    icon: BarChart3,
  },
  {
    title: "اسأل عن الخطوة التالية",
    copy: "يشرح الشريك الذكي ما الذي تغيّر وأي إجراء يجب أن يحدث اليوم.",
    icon: Bot,
  },
] as const;

const featureGrid = [
  {
    title: "تدفق نقدي واضح",
    copy: "تبقى الإيرادات والمصروفات والربح في عرض تشغيلي واحد من دون مصطلحات مالية معقدة.",
    icon: Wallet,
  },
  {
    title: "رادار ضغط المصروفات",
    copy: "اكتشف تكاليف المواد والتوصيل والتسويق والمرافق قبل أن تستنزف الشهر.",
    icon: TrendingDown,
  },
  {
    title: "موجزات استراتيجية بالذكاء",
    copy: "احصل على توصيات عملية مبنية على الأرقام الموجودة داخل مساحة عملك.",
    icon: Lightbulb,
  },
  {
    title: "تقارير جاهزة للتصدير",
    copy: "حوّل النشاط المبعثر إلى ملخصات نظيفة للممولين والشركاء ومراجعتك الخاصة.",
    icon: FileText,
  },
] as const;

const trustItems = [
  "مبني للأعمال التي يديرها أصحابها",
  "مساحة عمل خاصة افتراضياً",
  "من دون طقوس تنظيف جداول البيانات",
] as const;

const faqItems = [
  {
    question: "ما هو شريكك؟",
    answer:
      "شريكك هو مساعد تجاري ذكي يجمع المبيعات والمصروفات والتدفق النقدي والأهداف في لوحة واحدة هادئة، ثم يساعدك على تحديد الخطوة التالية.",
  },
  {
    question: "كيف يعمل الشريك الذكي؟",
    answer:
      "يقرأ سجل المعاملات، ويكتشف الأنماط، ويقدم موجزات قصيرة قابلة للتنفيذ فوراً.",
  },
  {
    question: "هل بياناتي خاصة؟",
    answer:
      "نعم. مساحة عملك خاصة افتراضياً. لا مشاركة ولا لوحات عامة، وأنت تتحكم بدقة في البيانات المخزنة.",
  },
  {
    question: "هل أستطيع البدء مجاناً؟",
    answer:
      "يمكنك استكشاف اللوحة الحية ومحتوى التعلم الآن. وعندما تكون جاهزاً، أدخل أرقامك الحقيقية من دون ترقية مستعجلة.",
  },
];

useSeoMeta({
  title: "شريكك - مساعدك التجاري الذكي",
  description:
    "شريكك مساعد تجاري ذكي للأعمال التي يديرها أصحابها، يحول التدفق النقدي والمصروفات والمعاملات والأهداف إلى خطوات واضحة.",
  ogTitle: "شريكك - مساعدك التجاري الذكي",
  ogDescription:
    "أدر المبيعات والمصروفات والرؤى والإرشاد الذكي من لوحة أعمال واحدة هادئة.",
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: { lang: "ar" },
});
</script>

<template>
  <div
    class="min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
  >
    <!-- Skip link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      الانتقال إلى المحتوى الرئيسي
    </a>

    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl"
    >
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="التنقل الرئيسي"
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
              شريكك
            </span>
            <span
              class="block truncate text-xs font-medium text-muted-foreground"
            >
              مساعدك التجاري الذكي
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
                <span class="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader>
                <SheetTitle>شريكك</SheetTitle>
                <SheetDescription>مساعدك التجاري الذكي</SheetDescription>
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
            <NuxtLink to="/chat">اسأل الذكاء</NuxtLink>
          </Button>
          <Button as-child class="h-9">
            <NuxtLink to="/dashboard">
              افتح لوحة التحكم
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
            تمويل يديره المالك من دون ضبابية
          </Badge>

          <h1
            class="mt-6 max-w-4xl text-balance text-5xl font-black leading-[.92] tracking-normal text-foreground sm:text-6xl lg:text-7xl"
          >
            يحول شريكك فوضى العمل اليومية إلى أفضل خطوة تالية.
          </h1>
          <p
            class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            مساعد تجاري ذكي هادئ للفرق الصغيرة التي تحتاج المبيعات
            والمصروفات والتدفق النقدي والتعلم والأهداف والنصيحة في مكان واحد.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as-child size="lg" class="h-12 px-5">
              <NuxtLink to="/dashboard">
                شاهد اللوحة الحية
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
                استكشف التعلم
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
          aria-label="لوحة شريكك تعرض الإيرادات وهامش الربح والتدفق النقدي والأهداف ونصائح الذكاء."
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
                      إشارة النقد اليوم
                    </p>
                    <p class="mt-1 truncate text-3xl font-black">
                      {{ currencyFormatter.format(890) }} ربح
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
                  <p class="text-sm font-black">موجز الذكاء جاهز</p>
                </div>
                <p class="mt-4 text-pretty text-2xl font-black leading-tight">
                  المصروفات تشكل 63% من الإيرادات. اجمع عمليات التوصيل وأعد
                  التفاوض على المواد أولاً.
                </p>
                <NuxtLink
                  to="/chat"
                  class="mt-5 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-3 py-2 text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  اسأل متابعة
                  <ArrowRight class="size-4" aria-hidden="true" />
                </NuxtLink>
              </div>

              <div
                class="rounded-md border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-black">تقدم الهدف</p>
                  <span
                    class="rounded-md bg-muted px-2 py-1 text-xs font-black text-muted-foreground"
                  >
                    نشط
                  </span>
                </div>
                <div class="mt-5 space-y-4">
                  <div>
                    <div class="flex justify-between gap-3 text-sm">
                      <span class="font-semibold">الربح الشهري</span>
                      <span class="font-bold">45%</span>
                    </div>
                    <Progress
                      :model-value="45"
                      class="mt-2 h-2 [&>div]:bg-chart-4"
                    />
                  </div>
                  <div>
                    <div class="flex justify-between gap-3 text-sm">
                      <span class="font-semibold">التحكم بالمصروفات</span>
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
                <p class="text-sm font-black">المعاملات التالية</p>
                <div class="mt-4 grid gap-3 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">بيع 10 قطع</span>
                    <span class="font-black text-chart-4">+$100</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">شراء مواد</span>
                    <span class="font-black text-destructive">-$60</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="min-w-0 truncate">رسوم التوصيل</span>
                    <span class="font-black text-destructive">-$10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats banner -->
      <section class="border-y bg-card" aria-label="نتائج المنتج">
        <div
          class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8"
        >
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">3</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              توحيد العمليات: تتبع، رؤية، إجراء.
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">24</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              تتحول المعاملات إلى قصة أعمال مقروءة.
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-4xl font-black tabular-nums">1</p>
            <p class="mt-1 text-sm font-semibold text-muted-foreground">
              شريك ذكي يركز على القرار المفيد التالي.
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
            حلقة التشغيل
          </Badge>
          <h2
            class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
          >
            الإيقاع اليومي الذي يحافظ على شفافية العمل الصغير.
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
                الخطوة {{ index + 1 }}
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
              محرك الرؤى
            </Badge>
            <h2
              class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
            >
              لا يكتفي بإظهار الأرقام. بل يشرح ما الذي يجب فعله بعد ذلك.
            </h2>
            <p
              class="mt-5 text-pretty text-lg leading-8 text-primary-foreground/75"
            >
              يجمع شريكك سجل معاملاتك وضغط الفئات والأهداف ومسار التعلم في
              إرشاد تجاري قصير وقابل للاستخدام.
            </p>
            <Button
              as-child
              class="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <NuxtLink to="/insights">
                عرض الرؤى
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
            مبني ليبدأ الآن
          </Badge>
          <h2
            class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
          >
            لوحة أعمال من دون طقوس المؤسسات.
          </h2>
          <p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
            استخدم اللوحة اليوم، وأدخل المعاملات الحقيقية عندما تكون
            جاهزاً، واجعل كل توصية مرتبطة بسلوك عمل يمكن ملاحظته.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CircleDollarSign
                class="size-7 text-chart-4"
                aria-hidden="true"
              />
              <CardTitle class="text-2xl font-black">للأصحاب</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="leading-7 text-muted-foreground">
                افحص نبض العمل قبل فتح المتجر أو طلبات الموردين أو الإنفاق على
                الترويج.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <LockKeyhole class="size-7 text-destructive" aria-hidden="true" />
              <CardTitle class="text-2xl font-black">للاطمئنان</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="leading-7 text-muted-foreground">
                اجعل القرارات مستندة إلى سجلات نظيفة وتقارير واضحة وسياق
                حسابات مفهومة.
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
          الأسئلة الشائعة
        </Badge>
        <h2
          class="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl"
        >
          أسئلة قد تطرحها قبل أن تثق بالأرقام.
        </h2>
        <Accordion type="single" collapsible class="mt-10 w-full">
          <AccordionItem
            v-for="(item, index) in faqItems"
            :key="index"
            :value="`item-${index}`"
          >
            <AccordionTrigger class="text-start font-semibold">{{
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
            <p class="text-sm font-black uppercase">جاهز عندما تكون أنت جاهزاً</p>
            <h2
              class="mt-3 text-balance text-3xl font-black leading-tight sm:text-5xl"
            >
              توقف عن التخمين أين ذهب المال. وابدأ في تحديد ما يحدث بعد ذلك.
            </h2>
          </div>
          <Button
            as-child
            size="lg"
            class="h-12 shrink-0 bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
          >
            <NuxtLink to="/dashboard">
              تشغيل شريكك
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
