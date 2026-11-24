import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Gamepad2,
  RefreshCw,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ProductPreview } from "@/components/home/HomeDashboard";
import {
  FaqSection,
  PricingTeaser,
  RankingSection,
} from "@/components/home-v2/HomeSections";
import { HomeFooterV2 } from "@/components/home-v2/HomeFooterV2";
import { GamingBackground } from "@/components/gaming/GamingBackground";

type HomeSimpleProps = {
  taskCount: number;
  sheetCount: number;
  minigameCount: number;
};

type Step = {
  title: string;
  text: string;
  href: string;
  action: string;
  icon: LucideIcon;
};

const STEPS: readonly Step[] = [
  {
    title: "Zrób diagnozę",
    text: "8 pytań i 2 minuty. Zobacz, co umiesz, a od czego zacząć.",
    href: "/diagnostyka",
    action: "Zacznij diagnozę",
    icon: Target,
  },
  {
    title: "Trenuj temat po temacie",
    text: "Krótka teoria, potem zadania z rozwiązaniami krok po kroku.",
    href: "/trening",
    action: "Wejdź do treningu",
    icon: BookOpen,
  },
  {
    title: "Sprawdź się na arkuszach",
    text: "Oficjalne arkusze CKE z kluczem i pełnymi rozwiązaniami.",
    href: "/trening/arkusze",
    action: "Zobacz arkusze",
    icon: FileText,
  },
];

const MORE: readonly Step[] = [
  {
    title: "Powtórki",
    text: "Zadania wracają dokładnie wtedy, gdy zaczynasz je zapominać.",
    href: "/powtorki",
    action: "Otwórz powtórki",
    icon: RefreshCw,
  },
  {
    title: "Minigry na 60 s",
    text: "Szybkie rachunki w głowie zamiast przewijania telefonu.",
    href: "/minigry",
    action: "Zagraj",
    icon: Gamepad2,
  },
  {
    title: "Asystent AI",
    text: "Podpowiedź, gdy utkniesz - bez podawania gotowego wyniku.",
    href: "/trening",
    action: "Wypróbuj w treningu",
    icon: Sparkles,
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <Link
      href={step.href}
      className="group card-raised flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-accent/50 sm:p-6"
    >
      <span className="icon-chip h-11 w-11">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-accent">
        Krok {index + 1}
      </span>
      <h3 className="mt-1 text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
      <span className="mt-auto pt-4 text-sm font-bold text-accent">
        {step.action} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function MoreCard({ item }: { item: Step }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group card-raised flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-accent/50 sm:p-6"
    >
      <span className="icon-chip h-11 w-11">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
      <span className="mt-auto pt-4 text-sm font-bold text-accent">
        {item.action} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export function HomeSimple({
  taskCount,
  sheetCount,
  minigameCount,
}: HomeSimpleProps) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate -mx-4 overflow-hidden border-b border-surface-border sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
        <GamingBackground variant="hero" />
        <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
          <div className="home-grid-bg absolute inset-0" />
        </div>

        <div className="page-container relative z-10">
          <div className="grid items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,0.85fr)] lg:gap-12 lg:px-10 lg:py-20 xl:px-12 2xl:px-16">
            <div>
              <h1 className="max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]">
                <span className="text-foreground">Przygotuj się do</span>
                <br />
                <span className="text-accent">egzaminu z matematyki.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Teoria, zadania i arkusze CKE w jednym miejscu. Zacznij od
                jednego zadania - konto założysz w 30 sekund.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/login?mode=signup"
                  className="btn-chunky px-7 py-4 text-base sm:px-8"
                >
                  Załóż darmowe konto
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="#szybka-proba"
                  className="rounded-xl border border-surface-border bg-surface px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
                >
                  Wypróbuj bez konta
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-bold text-muted underline decoration-surface-border underline-offset-4 transition hover:text-foreground"
                >
                  Mam już konto
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />0 zł na
                  start
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  {taskCount}+ zadań
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  {sheetCount} arkuszy CKE
                </span>
              </div>
            </div>

            <div id="szybka-proba" className="scroll-mt-24">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      <section
        id="jak-to-dziala"
        className="border-b border-surface-border py-14 sm:py-20"
        aria-labelledby="jak-to-dziala-heading"
      >
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">JAK TO DZIAŁA</p>
            <h2
              id="jak-to-dziala-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Trzy kroki do egzaminu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Nie musisz wiedzieć, od czego zacząć. Wystarczy pierwszy krok.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-surface-border bg-surface/35 py-14 sm:py-20"
        aria-labelledby="wiecej-heading"
      >
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">WIĘCEJ NIŻ ZADANIA</p>
            <h2
              id="wiecej-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Żeby wiedza została na dłużej
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {minigameCount} minigier, powtórki i asystent AI - wszystko w tym
              samym koncie.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {MORE.map((item) => (
              <MoreCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <RankingSection />
      <FaqSection />
      <PricingTeaser />

      <div className="page-container px-4 pb-10 pt-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <HomeFooterV2 />
      </div>
    </div>
  );
}
