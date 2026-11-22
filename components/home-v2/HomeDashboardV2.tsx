import {
  ArrowRight,
  Check,
  Gamepad2,
  Target,
} from "lucide-react";
import Link from "next/link";

import { DailyPuzzle, FormulaSheet, ProductPreview } from "@/components/home/HomeDashboard";
import { MinigamePromo } from "@/components/home/MinigamePromo";
import { AiSection, FaqSection, PricingTeaser, RankingSection, TeacherBand, TestsSection } from "@/components/home-v2/HomeSections";
import { FeatureGrid } from "@/components/home-v2/FeatureGrid";
import { HomeFooterV2 } from "@/components/home-v2/HomeFooterV2";
import { WeekSection } from "@/components/home-v2/WeekSection";
import { GamingBackground } from "@/components/gaming/GamingBackground";

type HomeDashboardV2Props = {
  taskCount: number;
  sheetCount: number;
  topicCount: number;
  minigameCount: number;
};

function WarmupSection() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="page-container relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <p className="text-overline">DARMOWA ROZGRZEWKA</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Zanim założysz konto — wzory i zagadka dnia.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Sześć wzorów na start i jedno pytanie dziennie. Bez konta i bez
            zobowiązań — konto dodasz w każdej chwili, gdy zechcesz zapisywać
            postęp.
          </p>
        </div>

        <FormulaSheet />

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
          <DailyPuzzle />
          <Link
            href="/diagnostyka"
            className="card-raised group flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <span>
              <span className="block text-sm font-bold text-muted">
                Gotowy na więcej?
              </span>
              <span className="mt-1 block text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
                Zrób diagnozę startową
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-accent transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeDashboardV2({
  taskCount,
  sheetCount,
  topicCount,
  minigameCount,
}: HomeDashboardV2Props) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate -mx-4 overflow-hidden border-b border-surface-border sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
        <GamingBackground variant="hero" />
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <div className="home-grid-bg absolute inset-0" />
        </div>

        <div className="page-container relative z-10">
          <div className="grid items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 md:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,0.82fr)] lg:gap-14 lg:px-10 lg:py-24 xl:px-12 2xl:px-16">
            <div>
              <h1 className="max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]">
                <span className="text-foreground">Przygotuj się do</span>
                <br />
                <span className="text-accent">egzaminu z matematyki.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Teoria, zadania, arkusze CKE, powtórki i gry — w jednym miejscu.
                Bez skakania po dziesięciu stronach i bez zgadywania, od czego
                zacząć.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
                <Link
                  href="/trening"
                  className="btn-chunky px-7 py-4 text-base sm:px-8"
                >
                  Zacznij trening
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/diagnostyka"
                  className="rounded-xl border border-surface-border bg-surface px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
                >
                  <Target className="mr-2 inline h-4 w-4" aria-hidden />
                  Zrób diagnozę
                </Link>
                <Link
                  href="/trening/arkusze"
                  className="text-sm font-bold text-foreground underline decoration-surface-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
                >
                  Zobacz arkusze CKE
                </Link>
                <Link
                  href="/minigry"
                  className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition hover:border-accent/60 hover:bg-accent/15"
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden />
                  Minigra na 60 s
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Teoria i zadania krok po kroku
                </span>
                <span className="text-surface-border" aria-hidden>
                  •
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Matura i egzamin ósmoklasisty
                </span>
                <span className="text-surface-border" aria-hidden>
                  •
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Darmowe konto, bez karty
                </span>
              </div>
            </div>

            <ProductPreview />
          </div>

          <div className="border-t border-surface-border px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-muted">
                Wszystko, czego potrzebujesz do regularnej nauki
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {[
                  { label: "Minigry", value: String(minigameCount) },
                  { label: "Zadania", value: `${taskCount}+` },
                  { label: "Arkusze", value: String(sheetCount) },
                  { label: "Tematy", value: String(topicCount) },
                ].map((item) => (
                  <div key={item.label} className="flex items-baseline gap-2">
                    <span className="font-bold tabular-nums text-foreground">
                      {item.value}
                    </span>
                    <span className="text-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureGrid />
      <MinigamePromo />
      <WeekSection />
      <RankingSection />
      <AiSection />
      <TestsSection />
      <TeacherBand />
      <WarmupSection />
      <FaqSection />
      <PricingTeaser />

      <div className="page-container px-4 pb-10 pt-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <HomeFooterV2 />
      </div>
    </div>
  );
}
