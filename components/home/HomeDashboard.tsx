"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { QuickTrial } from "@/components/home/QuickTrial";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLatestSolvedTopic } from "@/lib/supabase/solved-tasks";
import type { RecentTrainingTopic } from "@/lib/trening/recent-topic";
import { buildTopicHref } from "@/lib/trening/slugs";
import { topicDisplayName } from "@/lib/trening/slugs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Gamepad2,
  Library,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ENTRY_PATHS = [
  {
    href: "/trening",
    eyebrow: "NAJLEPSZY START",
    label: "Trening tematów",
    text: "Krótka teoria, potem zadania. Budujesz pewność bez skakania po przypadkowych materiałach.",
    action: "Zacznij od podstaw",
    icon: BookOpen,
    featured: true,
  },
  {
    href: "/baza-zadan",
    eyebrow: "KONKRETNE ZADANIE",
    label: "Baza zadań",
    text: "Wybierz dział, poziom i zadanie. Gdy utkniesz, dostajesz rozwiązanie krok po kroku.",
    action: "Przeglądaj bazę",
    icon: Library,
    featured: false,
  },
  {
    href: "/trening/arkusze",
    eyebrow: "PRÓBA GENERALNA",
    label: "Arkusze CKE",
    text: "Sprawdź się na oficjalnych arkuszach maturalnych i egzaminie ósmoklasisty.",
    action: "Otwórz arkusze",
    icon: FileText,
    featured: false,
  },
] as const;

const INSIDE_SECTIONS = [
  {
    href: "/trening",
    title: "Trening",
    text: "Tematy z teorią i zadaniami.",
    icon: BookOpen,
  },
  {
    href: "/baza-zadan",
    title: "Baza zadań",
    text: "Zadania z rozwiązaniami krok po kroku.",
    icon: Library,
  },
  {
    href: "/minigry",
    title: "Minigry",
    text: "Szybkie liczenie w formie gry.",
    icon: Gamepad2,
  },
  {
    href: "/trening/arkusze",
    title: "Arkusze CKE",
    text: "Matura i egzamin ósmoklasisty.",
    icon: FileText,
  },
  {
    href: "/rankingi",
    title: "Rankingi",
    text: "Porównaj wynik z innymi.",
    icon: Trophy,
  },
] as const;

const WHY_IT_WORKS = [
  "Zadania z rozwiązaniami krok po kroku",
  "Trening pod presją czasu",
  "Oficjalne arkusze CKE",
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ProductPreview() {
  const [recentTopic, setRecentTopic] =
    useState<RecentTrainingTopic | null>(null);

  useEffect(() => {
    let cancelled = false;
    let authRevision = 0;
    const hasSupabaseConfig = isSupabaseConfigured();
    let supabase: ReturnType<typeof getSupabase> | null = null;
    if (hasSupabaseConfig) {
      try {
        supabase = getSupabase();
      } catch (error) {
        console.warn("[szybka-matma] dashboard client:", error);
      }
    }

    const loadRecentTopic = async () => {
      const revision = authRevision;
      if (hasSupabaseConfig && !supabase) return;
      let userId: string | null = null;

      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          userId = data.session?.user?.id ?? null;
        } catch (error) {
          if (revision === authRevision) {
            console.warn("[szybka-matma] dashboard session:", error);
          }
          return;
        }
      }

      if (cancelled || revision !== authRevision) return;
      if (!userId || !supabase) {
        setRecentTopic(null);
        return;
      }

      const latestSolved = await fetchLatestSolvedTopic(userId);
      if (cancelled || revision !== authRevision) return;

      if (
        latestSolved?.examType === "matura_podstawowa" ||
        latestSolved?.examType === "8_klasa"
      ) {
        setRecentTopic({
          examKey: latestSolved.examType,
          category: latestSolved.category,
          topic: latestSolved.topic,
          visitedAt: Date.parse(latestSolved.solvedAt) || Date.now(),
        });
      } else {
        setRecentTopic(null);
      }
    };

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      authRevision += 1;
      const userId = session?.user?.id ?? null;
      if (!userId) {
        setRecentTopic(null);
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) void loadRecentTopic();
      }, 0);
    }).data.subscription;

    void loadRecentTopic();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  if (!recentTopic) return <QuickTrial />;

  const topicLabel = topicDisplayName(
    recentTopic.examKey,
    recentTopic.category,
    recentTopic.topic,
  );
  const levelLabel =
    recentTopic.examKey === "8_klasa"
      ? "egzamin ósmoklasisty"
      : "poziom podstawowy";
  const topicHref = buildTopicHref(
    recentTopic.examKey,
    recentTopic.category,
    recentTopic.topic,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="card-raised relative overflow-hidden p-4 sm:p-6"
      aria-label="Ostatni temat"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <p className="text-overline">Ostatni temat</p>
          <span className="icon-chip h-11 w-11 shrink-0">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <Link
          href={topicHref}
          className="group mt-6 block rounded-2xl border border-surface-border bg-background/70 p-4 transition-colors hover:border-accent/60 hover:bg-background sm:p-5"
          aria-label={`Wróć do tematu ${topicLabel}`}
        >
          <p className="text-overline">KONTYNUUJ NAUKĘ</p>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-2xl">
            {topicLabel}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Wróć do ostatnio otwartego tematu · {levelLabel}
          </p>
          <p className="mt-5 rounded-xl bg-accent-soft/60 px-3 py-2.5 text-sm font-semibold text-accent">
            Otwórz temat i kontynuuj od miejsca, w którym skończyłeś.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm font-bold text-accent">
            <span>Wróć do tematu</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

function EntryPathCard({
  href,
  eyebrow,
  label,
  text,
  action,
  icon: Icon,
  featured,
}: (typeof ENTRY_PATHS)[number]) {
  return (
    <Link
      href={href}
      className={`group card-raised flex min-h-64 flex-col p-5 sm:p-6 ${
        featured
          ? "border-accent/45 bg-accent-soft/35 hover:border-accent/70"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="icon-chip h-12 w-12 shrink-0">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight
          className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent"
          aria-hidden
        />
      </div>
      <p className="mt-6 text-overline">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground group-hover:text-accent">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
      <span className="mt-auto pt-6 text-sm font-bold text-foreground group-hover:text-accent">
        {action} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export function HomeDashboard() {
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
              <motion.h1
                className="max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                <span className="text-foreground">Przygotuj się do</span>
                <br />
                <span className="text-accent">egzaminu z matematyki.</span>
              </motion.h1>

              <motion.p
                className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.14 }}
              >
                Wybierz temat, rozwiązuj zadania i sprawdzaj się na arkuszach
                CKE - wszystko w jednym miejscu.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/trening"
                  className="btn-chunky px-7 py-4 text-base sm:px-8"
                >
                  Zacznij trening
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/trening/arkusze"
                  className="text-sm font-bold text-foreground underline decoration-surface-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
                >
                  Zobacz arkusze CKE
                </Link>
              </motion.div>

              <motion.div
                className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.26 }}
              >
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
              </motion.div>
            </div>

            <ProductPreview />
          </div>

          <div className="border-t border-surface-border px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-muted">
                Wszystko, czego potrzebujesz do regularnej nauki
              </p>
              <PlatformStatus variant="inline" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border py-14 sm:py-20">
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">TRZY DROGI, JEDEN CEL</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Wybierz swój pierwszy krok
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Nie musisz wiedzieć, od czego zacząć. Wybierz tryb, który pasuje
              do tego, czego potrzebujesz dzisiaj.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ENTRY_PATHS.map((item) => (
              <EntryPathCard key={item.href} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border bg-surface/35 py-14 sm:py-20">
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="text-overline">MATERIAŁY W ŚRODKU</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Nie zaczynasz od pustej kartki
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Masz gotową bazę do pracy: zadania, minigry i oficjalne arkusze.
                Wchodzisz, wybierasz cel i robisz następny krok.
              </p>
            </div>
            <PlatformStatus variant="cards" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="page-container relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">CO ZNAJDZIESZ W ŚRODKU</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Wszystko do nauki w jednym miejscu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Wybierz dział i zacznij od tego, czego potrzebujesz dzisiaj.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-5 lg:gap-4">
            {INSIDE_SECTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="card-raised group flex h-full items-start gap-4 p-4 sm:p-5 lg:flex-col lg:p-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.text}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
            <div className="card-raised flex flex-col justify-between gap-5 p-5 sm:p-6">
              <div>
                <p className="text-overline">DLACZEGO TO DZIAŁA</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground">
                  Nauka, która nie kończy się na teorii
                </h3>
              </div>
              <ul className="flex flex-wrap gap-2 text-xs font-bold">
                {WHY_IT_WORKS.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-2 text-accent"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/trening"
              className="card-raised group flex items-center justify-between gap-4 p-5 sm:p-6"
            >
              <span>
                <span className="block text-sm font-bold text-muted">
                  Gotowy?
                </span>
                <span className="mt-1 block text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
                  Przejdź do treningu
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
    </div>
  );
}
