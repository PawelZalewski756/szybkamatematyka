"use client";

import { PlatformStatus } from "@/components/home/PlatformStatus";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLatestSolvedTopic } from "@/lib/supabase/solved-tasks";
import { isDue } from "@/lib/powtorki/scheduler";
import { loadSchedule } from "@/lib/powtorki/storage";
import { examKeyForLearningPath, getFirstTopic } from "@/lib/trening/next-topic";
import {
  loadRecentTrainingTopic,
  type RecentTrainingTopic,
} from "@/lib/trening/recent-topic";
import { buildTopicHref, topicDisplayName } from "@/lib/trening/slugs";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Gamepad2,
  Library,
  RotateCcw,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Destination = {
  href: string;
  label: string;
  text: string;
  icon: LucideIcon;
};

const DESTINATIONS: readonly Destination[] = [
  {
    href: "/trening",
    label: "Trening",
    text: "Teoria i zadania podzielone na tematy.",
    icon: BookOpen,
  },
  {
    href: "/baza-zadan",
    label: "Baza zadań",
    text: "Wybierz zadanie i zobacz rozwiązanie krok po kroku.",
    icon: Library,
  },
  {
    href: "/trening/arkusze",
    label: "Arkusze CKE",
    text: "Oficjalne arkusze maturalne i ósmoklasisty.",
    icon: FileText,
  },
  {
    href: "/minigry",
    label: "Minigry",
    text: "Krótkie gry do ćwiczenia rachunków.",
    icon: Gamepad2,
  },
];

const STEPS = [
  "Wybierz egzamin.",
  "Przeczytaj krótką teorię i rozwiąż zadania.",
  "Sprawdź się na arkuszu CKE.",
] as const;

function PathChoice({
  label,
  hint,
  href,
  onChoose,
}: {
  label: string;
  hint: string;
  href: string;
  onChoose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onChoose}
      className="card-raised group flex items-center justify-between gap-4 p-5"
    >
      <span className="min-w-0">
        <span className="block text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
          {label}
        </span>
        <span className="mt-1 block text-sm text-muted">{hint}</span>
      </span>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-accent transition group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}

function GuestHome() {
  const { setPath } = useLearningPath();
  const sp = getFirstTopic("8_klasa");
  const matura = getFirstTopic("matura_podstawowa");

  return (
    <>
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Matematyka na maturę i egzamin ósmoklasisty
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Krótka teoria, zadania z rozwiązaniami i arkusze CKE w jednym
            miejscu. Zacznij od razu, bez zakładania konta.
          </p>

          <p className="mt-10 text-sm font-semibold text-muted">
            Do czego się przygotowujesz?
          </p>
          <div className="mt-3 grid gap-3 text-left sm:grid-cols-2">
            <PathChoice
              label="Egzamin ósmoklasisty"
              hint="Zacznij od pierwszego tematu"
              href={sp?.href ?? "/trening"}
              onChoose={() => setPath("sp")}
            />
            <PathChoice
              label="Matura podstawowa"
              hint="Zacznij od pierwszego tematu"
              href={matura?.href ?? "/trening"}
              onChoose={() => setPath("srednia")}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <PlatformStatus variant="inline" />
          </div>
        </div>
      </section>

      <section className="border-t border-surface-border py-12 sm:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Co znajdziesz w środku
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map(({ href, label, text, icon: Icon }) => (
            <Link key={href} href={href} className="card-raised flex flex-col p-5">
              <span className="icon-chip h-10 w-10">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-4 text-base font-extrabold text-foreground">
                {label}
              </span>
              <span className="mt-1 text-sm leading-relaxed text-muted">{text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-surface-border py-12 sm:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Jak to działa
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((text, i) => (
            <li key={text} className="flex items-start gap-3 text-sm text-muted">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{text}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/trening"
          className="btn-chunky mt-8 px-7 py-3.5 text-base"
        >
          Zacznij naukę
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </section>
    </>
  );
}

function ReturningHome({
  recent,
  dueCount,
}: {
  recent: RecentTrainingTopic | null;
  dueCount: number;
}) {
  const { path } = useLearningPath();
  const fallback = getFirstTopic(examKeyForLearningPath(path));
  const href = recent
    ? buildTopicHref(recent.examKey, recent.category, recent.topic)
    : (fallback?.href ?? "/trening");
  const title = recent
    ? topicDisplayName(recent.examKey, recent.category, recent.topic)
    : (fallback?.name ?? "Pierwszy temat");

  const shortcuts: readonly (Destination & { badge?: string })[] = [
    {
      href: "/powtorki",
      label: "Powtórki",
      text: dueCount > 0 ? "Zadania czekają na powtórkę." : "Wracaj do trudniejszych zadań.",
      icon: RotateCcw,
      badge: dueCount > 0 ? String(dueCount) : undefined,
    },
    {
      href: "/wyzwania",
      label: "Wyzwanie dnia",
      text: "Pięć pytań na czas.",
      icon: Flame,
    },
    {
      href: "/trening/arkusze",
      label: "Arkusze CKE",
      text: "Sprawdź się na prawdziwym arkuszu.",
      icon: FileText,
    },
    {
      href: "/baza-zadan",
      label: "Baza zadań",
      text: "Wybierz konkretne zadanie.",
      icon: Library,
    },
    {
      href: "/minigry",
      label: "Minigry",
      text: "Szybki trening rachunków.",
      icon: Gamepad2,
    },
    {
      href: "/rankingi",
      label: "Rankingi",
      text: "Porównaj wyniki z innymi.",
      icon: Trophy,
    },
  ];

  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {recent ? "Kontynuuj naukę" : "Zacznij naukę"}
        </h1>

        <Link
          href={href}
          data-testid="home-continue"
          className="card-raised group mt-6 flex items-center justify-between gap-4 border-accent/40 p-5 sm:p-6"
        >
          <span className="min-w-0">
            <span className="text-overline">
              {recent ? "Ostatni temat" : "Pierwszy temat"}
            </span>
            <span className="mt-1 block truncate text-xl font-extrabold tracking-tight text-foreground group-hover:text-accent sm:text-2xl">
              {title}
            </span>
          </span>
          <span className="btn-chunky shrink-0 px-5 py-3 text-sm">
            {recent ? "Kontynuuj" : "Zacznij"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>

        <h2 className="mt-10 text-sm font-semibold text-muted">Na dziś</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href: to, label, text, icon: Icon, badge }) => (
            <Link
              key={to}
              href={to}
              className="card-raised flex items-center gap-4 p-4"
            >
              <span className="icon-chip h-10 w-10 shrink-0">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-foreground">
                  {label}
                </span>
                <span className="block truncate text-sm text-muted">{text}</span>
              </span>
              {badge ? (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-on-accent">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeDashboard() {
  const [recent, setRecent] = useState<RecentTrainingTopic | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let userId: string | null = null;
      if (isSupabaseConfigured()) {
        try {
          const { data } = await getSupabase().auth.getSession();
          userId = data.session?.user?.id ?? null;
        } catch (error) {
          console.warn("[szybka-matma] dashboard session:", error);
        }
      }
      if (cancelled) return;

      setLoggedIn(Boolean(userId));
      const now = Date.now();
      setDueCount(
        Object.values(loadSchedule(userId)).filter((item) => isDue(item, now))
          .length,
      );

      const local = loadRecentTrainingTopic(userId) ?? loadRecentTrainingTopic(null);
      if (local) {
        setRecent(local);
        return;
      }
      if (!userId) return;

      const latest = await fetchLatestSolvedTopic(userId);
      if (cancelled || !latest) return;
      if (latest.examType === "matura_podstawowa" || latest.examType === "8_klasa") {
        setRecent({
          examKey: latest.examType,
          category: latest.category,
          topic: latest.topic,
          visitedAt: Date.parse(latest.solvedAt) || Date.now(),
        });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {recent || loggedIn ? (
        <ReturningHome recent={recent} dueCount={dueCount} />
      ) : (
        <GuestHome />
      )}
    </div>
  );
}
