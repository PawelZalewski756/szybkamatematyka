"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { useLearningPath } from "@/components/LearningPathProvider";
import { learningPathLabel } from "@/lib/learning-path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLatestSolvedTopic } from "@/lib/supabase/solved-tasks";
import {
  loadRecentTrainingTopic,
  type RecentTrainingTopic,
} from "@/lib/trening/recent-topic";
import { buildTopicHref } from "@/lib/trening/slugs";
import { topicDisplayName } from "@/lib/trening/slugs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  Flame,
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

const STEPS = [
  {
    n: "01",
    title: "Wybierasz ścieżkę",
    text: "Matura albo egzamin ósmoklasisty — widzisz materiały dopasowane do celu.",
  },
  {
    n: "02",
    title: "Robisz mały krok",
    text: "Jeden temat, kilka zadań i jasne rozwiązanie, kiedy potrzebujesz podpowiedzi.",
  },
  {
    n: "03",
    title: "Sprawdzasz wynik",
    text: "Arkusz CKE pokazuje, czy wiedza działa także pod presją czasu.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ProductPreview({
  path,
  pathLabel,
}: {
  path: "sp" | "srednia";
  pathLabel: string;
}) {
  const sampleTopic =
    path === "sp"
      ? {
          examKey: "8_klasa" as const,
          topic: "rownania",
          topicLabel: "Równania",
          levelLabel: "egzamin ósmoklasisty",
        }
      : {
          examKey: "matura_podstawowa" as const,
          topic: "rownania_liniowe",
          topicLabel: "Równania liniowe",
          levelLabel: "poziom podstawowy",
        };
  const [recentTopic, setRecentTopic] =
    useState<RecentTrainingTopic | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRecentTopic = async () => {
      let userId: string | null = null;

      if (isSupabaseConfigured()) {
        try {
          const { data } = await getSupabase().auth.getSession();
          userId = data.session?.user?.id ?? null;
        } catch (error) {
          console.warn("[szybka-matma] dashboard session:", error);
        }
      }

      const localTopic = loadRecentTrainingTopic(userId);
      if (localTopic) {
        if (!cancelled) setRecentTopic(localTopic);
        return;
      }

      if (!userId || !isSupabaseConfigured()) {
        if (!cancelled) setRecentTopic(null);
        return;
      }

      const latestSolved = await fetchLatestSolvedTopic(userId);
      if (cancelled) return;

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

    void loadRecentTopic();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasRecentTopic = recentTopic !== null;
  const activeTopic = recentTopic ?? {
    examKey: sampleTopic.examKey,
    category: "algebra",
    topic: sampleTopic.topic,
  };
  const activeTopicLabel = recentTopic
    ? topicDisplayName(
        recentTopic.examKey,
        recentTopic.category,
        recentTopic.topic,
      )
    : sampleTopic.topicLabel;
  const activeLevelLabel = recentTopic
    ? recentTopic.examKey === "8_klasa"
      ? "egzamin ósmoklasisty"
      : "poziom podstawowy"
    : sampleTopic.levelLabel;
  const topicHref = buildTopicHref(
    activeTopic.examKey,
    activeTopic.category,
    activeTopic.topic,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="card-raised relative overflow-hidden p-4 sm:p-6"
      aria-label="Podgląd sesji nauki"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-overline">
              {hasRecentTopic ? "Ostatni temat" : "Przykładowa sesja"}
            </p>
            <p className="mt-1 text-lg font-extrabold tracking-tight text-foreground">
              {pathLabel}
            </p>
          </div>
          <span className="icon-chip h-11 w-11 shrink-0">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <Link
          href={topicHref}
          className="group mt-6 block rounded-2xl border border-surface-border bg-background/70 p-4 transition-colors hover:border-accent/60 hover:bg-background sm:p-5"
          aria-label={`${hasRecentTopic ? "Wróć do tematu" : "Otwórz temat"} ${activeTopicLabel}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-overline">
              {hasRecentTopic ? "KONTYNUUJ NAUKĘ" : "NASTĘPNY TEMAT"}
            </p>
            {!hasRecentTopic && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                12 min
              </span>
            )}
          </div>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-2xl">
            {activeTopicLabel}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {hasRecentTopic
              ? `Wróć do ostatnio otwartego tematu · ${activeLevelLabel}`
              : `Przykładowy temat · ${activeLevelLabel}`}
          </p>

          {hasRecentTopic ? (
            <p className="mt-5 rounded-xl bg-accent-soft/60 px-3 py-2.5 text-sm font-semibold text-accent">
              Otwórz temat i kontynuuj od miejsca, w którym skończyłeś.
            </p>
          ) : (
            <p className="mt-5 rounded-xl bg-accent-soft/60 px-3 py-2.5 text-sm font-semibold text-accent">
              Zobacz, jak wygląda lekcja — bez zakładania konta.
            </p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm font-bold text-accent">
            <span>{hasRecentTopic ? "Wróć do tematu" : "Otwórz temat"}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </div>
        </Link>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-on-accent">
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
          {hasRecentTopic
            ? "Ostatnio otwarty temat czeka na Ciebie."
            : "Każdy temat kończy się zadaniem do sprawdzenia"}
        </div>
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
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

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
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft/70 px-3 py-1.5 text-xs font-bold text-accent"
                {...fadeUp}
                transition={{ duration: 0.45 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                Ścieżka: {pathLabel}
              </motion.div>

              <motion.h1
                className="mt-8 max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]"
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
                CKE — wszystko w jednym miejscu.
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

            <ProductPreview path={path} pathLabel={pathLabel} />
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
            <p className="text-overline">PROSTY RYTM NAUKI</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Od pierwszego zadania do wyniku
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Nie chodzi o siedzenie nad matematyką przez cały dzień. Chodzi o
              regularne, konkretne sesje.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="card-raised flex min-h-52 flex-col p-5 sm:p-6"
              >
                <span className="text-sm font-extrabold tracking-[0.12em] text-accent">
                  {step.n}
                </span>
                <h3 className="mt-7 text-xl font-extrabold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
            <div className="card-raised flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-overline">WIĘCEJ MOTYWACJI</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground">
                  Nauka, która nie kończy się na teorii
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  Wskocz w krótką minigrę, zrób wyzwanie dnia albo porównaj
                  wynik w rankingu.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 text-xs font-bold text-muted">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-2 text-accent">
                  <Gamepad2 className="h-3.5 w-3.5" aria-hidden />
                  Minigry
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-2 text-accent">
                  <Flame className="h-3.5 w-3.5" aria-hidden />
                  Wyzwania
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-2 text-accent">
                  <Trophy className="h-3.5 w-3.5" aria-hidden />
                  Rankingi
                </span>
              </div>
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
