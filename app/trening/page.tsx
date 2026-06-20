"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import {
  examTypeForKey,
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import { buildTreningTreeFromTasks } from "@/lib/trening/dynamic-tree";
import type {
  CategoryWithProgress,
  ExamWithProgress,
  TrainingTopicWithProgress,
} from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";
import { EmptyState } from "@/components/feedback/EmptyState";
import { fetchProfileAllowEmpty } from "@/lib/supabase/profiles";
import { fetchSolvedTaskIds } from "@/lib/supabase/solved-tasks";
import { fetchTasksForTree } from "@/lib/supabase/tasks";
import type { TopicStatus } from "@/types/database";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PATH_BANNER_KEY = "sm_trening_path_banner_v1";
const ONBOARDING_XP_MAX = 100;

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function topicMatchesQuery(
  categoryName: string,
  categoryId: string,
  topicName: string,
  topicId: string,
  query: string,
): boolean {
  if (!query) return true;
  const haystack = normalizeSearchText(
    `${categoryName} ${categoryId} ${topicName} ${topicId}`,
  );
  return haystack.includes(query);
}

function filterExamByQuery(
  exam: ExamWithProgress,
  rawQuery: string,
): ExamWithProgress {
  const query = normalizeSearchText(rawQuery);
  if (!query) return exam;

  const categories = exam.categories
    .map((category) => {
      const categoryMatches = topicMatchesQuery(
        category.name,
        category.id,
        "",
        "",
        query,
      );
      const topics = category.topics.filter((topic) =>
        topicMatchesQuery(
          category.name,
          category.id,
          topic.name,
          topic.id,
          query,
        ),
      );
      if (categoryMatches) return category;
      if (topics.length > 0) return { ...category, topics };
      return null;
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

function countTopics(exam: ExamWithProgress): number {
  return exam.categories.reduce((n, c) => n + c.topics.length, 0);
}

type TopicCardFilter = "all" | "incomplete" | "completed";
type TopicSort = "az" | "progress";

function filterTopicsByStatus(
  exam: ExamWithProgress,
  filter: TopicCardFilter,
): ExamWithProgress {
  if (filter === "all") return exam;

  const categories = exam.categories
    .map((category) => {
      const topics = category.topics.filter((topic) => {
        if (topic.total === 0) return false;
        if (filter === "completed") return topic.status === "completed";
        return topic.status !== "completed";
      });
      if (topics.length === 0) return null;
      return { ...category, topics };
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

function sortTopicsInExam(
  exam: ExamWithProgress,
  sort: TopicSort,
): ExamWithProgress {
  const categories = exam.categories.map((category) => {
    const topics = [...category.topics];
    if (sort === "az") {
      topics.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    } else {
      topics.sort(
        (a, b) =>
          b.percent - a.percent ||
          a.name.localeCompare(b.name, "pl"),
      );
    }
    return { ...category, topics };
  });
  return { ...exam, categories };
}

function findFirstPlayableTopic(
  exam: ExamWithProgress,
  examKey: SelectedExam,
): string | null {
  for (const category of exam.categories) {
    for (const topic of category.topics) {
      if (topic.total > 0) {
        return buildTopicHref(examKey, category.id, topic.id);
      }
    }
  }
  return null;
}

type SelectedExam = TreningExamKey;

const EXAM_OPTIONS: { key: SelectedExam; label: string }[] = [
  { key: "matura_podstawowa", label: "Matura Podstawowa" },
  { key: "8_klasa", label: "Egzamin 8-klasisty" },
];

function ExamSwitcher({
  selected,
  onChange,
}: {
  selected: SelectedExam;
  onChange: (exam: SelectedExam) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Wybór egzaminu"
      className="mx-auto flex w-full max-w-lg rounded-2xl border border-white/15 bg-white/[0.06] p-1 shadow-[0_0_32px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    >
      {EXAM_OPTIONS.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.key)}
            className={`relative flex-1 rounded-xl px-3 py-2.5 text-center text-xs font-bold transition-colors duration-200 sm:text-sm ${
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="trening-exam-pill"
                className="absolute inset-0 rounded-xl border border-fuchsia-400/30 bg-gradient-to-r from-violet-500/25 via-fuchsia-500/20 to-cyan-500/25 shadow-[0_0_20px_rgba(192,38,211,0.2)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TopicStatusIcon({ status }: { status: TopicStatus }) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className="h-6 w-6 shrink-0 text-emerald-400"
        aria-label="Ukończone"
      />
    );
  }
  if (status === "available") {
    return (
      <Play
        className="h-6 w-6 shrink-0 fill-cyan-400/20 text-cyan-400"
        aria-label="Dostępne"
      />
    );
  }
  return (
    <span className="shrink-0 text-xl" aria-label="Wkrótce">
      ⏳
    </span>
  );
}

function topicStatusEmoji(status: TopicStatus): string {
  if (status === "completed") return "✅";
  if (status === "available") return "▶️";
  if (status === "coming_soon") return "⏳";
  return "🔒";
}

function progressBarColor(percent: number): string {
  if (percent >= 100) return "from-emerald-500 to-emerald-400";
  if (percent >= 50) return "from-emerald-500 to-cyan-400";
  if (percent >= 25) return "from-violet-500 to-fuchsia-500";
  return "from-zinc-600 to-zinc-500";
}

function TopicCard({
  examKey,
  category,
  topic,
  highlighted,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  topic: TrainingTopicWithProgress;
  highlighted?: boolean;
}) {
  const isComingSoon = topic.status === "coming_soon";
  const isCompleted = topic.status === "completed";
  const canPlay = topic.total > 0;
  const href = buildTopicHref(examKey, category.id, topic.id);
  const progressLabel = `${topic.solved}/${topic.total}`;

  const cardInner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <TopicStatusIcon status={topic.status} />
        <span className="text-lg" aria-hidden>
          {topicStatusEmoji(topic.status)}
        </span>
      </div>
      <h3
        className={`mt-3 text-base font-black leading-snug sm:text-lg ${
          isCompleted
            ? "text-emerald-200"
            : isComingSoon
              ? "text-zinc-500"
              : "text-white"
        }`}
      >
        {topic.name}
      </h3>
      {canPlay ? (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Postęp</span>
            <span className="text-zinc-300">{progressLabel}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressBarColor(topic.percent)} transition-all duration-500`}
              style={{ width: `${topic.percent}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="mt-4 inline-flex rounded-full border border-white/10 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Wkrótce ⏳
        </span>
      )}
      {canPlay && (
        <p className="mt-3 text-xs font-semibold text-cyan-400/90">
          {isCompleted ? "Powtórz teorię i arenę" : "Teoria · Arena"}
        </p>
      )}
    </>
  );

  const cardClass =
    "flex h-full flex-col rounded-2xl border p-5 backdrop-blur-xl transition " +
    (highlighted
      ? "border-amber-400/50 bg-amber-500/10 shadow-[0_0_32px_rgba(251,191,36,0.2)] ring-2 ring-amber-400/40"
      : isComingSoon
        ? "cursor-default border-white/5 bg-zinc-900/40 text-zinc-500"
        : isCompleted
          ? "border-emerald-500/25 bg-emerald-500/5 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
          : "border-white/15 bg-white/[0.07] shadow-[0_0_32px_rgba(0,0,0,0.25)]");

  if (!canPlay) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardClass}
      >
        {cardInner}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 40px rgba(34,211,238,0.18)",
      }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      <Link
        href={href}
        className={`${cardClass} block hover:border-cyan-500/35 hover:bg-white/10`}
      >
        {cardInner}
      </Link>
    </motion.div>
  );
}

function CategorySection({
  examKey,
  category,
  index,
  highlightTopicHref,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  index: number;
  highlightTopicHref?: string | null;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index }}
      className="mt-12 first:mt-10"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/80">
            Dział
          </p>
          <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
            {category.name}
          </h2>
        </div>
        <div className="w-full max-w-xs sm:max-w-[14rem]">
          <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Postęp działu</span>
            <span className="text-zinc-300">{category.progressPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressBarColor(category.progressPercent)}`}
              style={{ width: `${category.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.topics.map((topic) => {
          const href = buildTopicHref(examKey, category.id, topic.id);
          return (
            <TopicCard
              key={topic.id}
              examKey={examKey}
              category={category}
              topic={topic}
              highlighted={
                !!highlightTopicHref && highlightTopicHref === href
              }
            />
          );
        })}
      </div>
    </motion.section>
  );
}

function emptyExamFor(key: SelectedExam): ExamWithProgress {
  return buildTreningTreeFromTasks([], new Set(), TRAINING_CURRICULUM[key]);
}

export default function TreningPage() {
  const [selectedExam, setSelectedExam] =
    useState<SelectedExam>("matura_podstawowa");
  const [exam, setExam] = useState<ExamWithProgress>(() =>
    emptyExamFor("matura_podstawowa"),
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<TopicCardFilter>("all");
  const [topicSort, setTopicSort] = useState<TopicSort>("az");
  const [showPathBanner, setShowPathBanner] = useState(false);
  const [pathBannerHref, setPathBannerHref] = useState<string | null>(null);

  const loadProgress = useCallback(async (examKey: SelectedExam) => {
    setLoading(true);
    try {
      const examType = examTypeForKey(examKey);
      const tasks = await fetchTasksForTree(examType);
      let solvedIds = new Set<string>();

      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        solvedIds = await fetchSolvedTaskIds(user.id);
      }

      setExam(
        buildTreningTreeFromTasks(tasks, solvedIds, TRAINING_CURRICULUM[examKey]),
      );
    } catch {
      setExam(emptyExamFor(examKey));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProgress(selectedExam);
  }, [selectedExam, loadProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (loading) return;
    try {
      if (localStorage.getItem(PATH_BANNER_KEY)) return;
    } catch {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const solvedIds = await fetchSolvedTaskIds(user.id);
      if (solvedIds.size > 0 || cancelled) return;

      const profile = await fetchProfileAllowEmpty(user.id);
      const xp = profile?.xp ?? 0;
      if (xp >= ONBOARDING_XP_MAX || cancelled) return;

      const href = findFirstPlayableTopic(exam, selectedExam);
      if (!href || cancelled) return;

      setPathBannerHref(href);
      setShowPathBanner(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, exam, selectedExam]);

  const dismissPathBanner = () => {
    try {
      localStorage.setItem(PATH_BANNER_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowPathBanner(false);
  };

  const handleExamChange = (key: SelectedExam) => {
    setSelectedExam(key);
    setExam(emptyExamFor(key));
    setSearchInput("");
    setDebouncedQuery("");
    setTopicFilter("all");
    setTopicSort("az");
  };

  const filteredExam = useMemo(() => {
    const searched = filterExamByQuery(exam, debouncedQuery);
    const statusFiltered = filterTopicsByStatus(searched, topicFilter);
    return sortTopicsInExam(statusFiltered, topicSort);
  }, [exam, debouncedQuery, topicFilter, topicSort]);

  const matchedTopicCount = useMemo(
    () => countTopics(filteredExam),
    [filteredExam],
  );

  const examSubtitle =
    selectedExam === "matura_podstawowa"
      ? "Matura podstawowa — działy i tematy z bazy zadań. Postęp z areny."
      : "Egzamin ósmoklasisty — działy i tematy z bazy zadań. Postęp z areny.";

  const overallProgress = useMemo(() => {
    const cats = exam.categories;
    if (cats.length === 0) return 0;
    const totalTasks = cats.reduce(
      (sum, c) => sum + c.topics.reduce((s, t) => s + t.total, 0),
      0,
    );
    const solvedTasks = cats.reduce(
      (sum, c) => sum + c.topics.reduce((s, t) => s + t.solved, 0),
      0,
    );
    if (totalTasks === 0) return 0;
    return Math.round((solvedTasks / totalTasks) * 100);
  }, [exam.categories]);

  const availableTopics = useMemo(
    () =>
      exam.categories.reduce(
        (n, c) => n + c.topics.filter((t) => t.total > 0).length,
        0,
      ),
    [exam.categories],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />

      <div className="relative z-10 flex w-full flex-1 flex-col py-8 sm:py-12">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/90 backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Z bazy zadań
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Ścieżka treningowa
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
            {examSubtitle}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="mx-auto mt-6 w-full max-w-lg px-1"
        >
          <ExamSwitcher selected={selectedExam} onChange={handleExamChange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mx-auto mt-6 w-full max-w-lg px-1"
        >
          <label className="sr-only" htmlFor="trening-search">
            Szukaj tematu
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              id="trening-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Szukaj działu lub tematu…"
              className="w-full rounded-2xl border border-white/15 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none backdrop-blur-xl focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          {debouncedQuery.trim() && !loading && (
            <p className="mt-2 text-center text-xs font-semibold text-zinc-400">
              Znaleziono{" "}
              <span className="text-cyan-300">{matchedTopicCount}</span>{" "}
              {matchedTopicCount === 1
                ? "temat"
                : matchedTopicCount >= 2 && matchedTopicCount <= 4
                  ? "tematy"
                  : "tematów"}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.045 }}
          className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-3 px-1"
        >
          <div
            role="group"
            aria-label="Filtr tematów"
            className="flex flex-wrap justify-center gap-2"
          >
            {(
              [
                { id: "all" as const, label: "Wszystkie" },
                { id: "incomplete" as const, label: "Nieukończone" },
                { id: "completed" as const, label: "Ukończone" },
              ] as const
            ).map((opt) => {
              const active = topicFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTopicFilter(opt.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    active
                      ? "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100"
                      : "border-white/15 bg-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label="Sortowanie tematów"
            className="flex flex-wrap justify-center gap-2"
          >
            {(
              [
                { id: "az" as const, label: "A-Z" },
                { id: "progress" as const, label: "Postęp ↓" },
              ] as const
            ).map((opt) => {
              const active = topicSort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTopicSort(opt.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    active
                      ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                      : "border-white/15 bg-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {showPathBanner && pathBannerHref && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-6 flex max-w-lg items-start gap-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3.5 shadow-[0_0_24px_rgba(251,191,36,0.12)] backdrop-blur-xl"
            >
              <p className="min-w-0 flex-1 text-sm text-amber-100/95">
                <span className="font-black text-amber-200">Nowa ścieżka?</span>{" "}
                Zacznij od teorii, potem arena{" "}
                <Link
                  href={pathBannerHref}
                  className="font-bold text-cyan-300 underline-offset-2 hover:underline"
                >
                  ➡️ pierwszy temat
                </Link>
              </p>
              <button
                type="button"
                onClick={dismissPathBanner}
                className="shrink-0 rounded-lg p-1 text-amber-200/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Zamknij podpowiedź"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-8 flex max-w-lg items-center gap-3 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-violet-600/25 to-fuchsia-600/15 px-5 py-4 shadow-[0_0_32px_rgba(192,38,211,0.15)] backdrop-blur-xl"
        >
          <GraduationCap className="h-9 w-9 shrink-0 text-fuchsia-300" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/90">
              {exam.shortLabel}
            </p>
            <p className="truncate text-lg font-black text-white">{exam.label}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                <>
                  Postęp{" "}
                  <span className="font-bold text-zinc-200">
                    {overallProgress}%
                  </span>
                  {" · "}
                  {availableTopics} aktywnych tematów
                </>
              )}
            </p>
          </div>
          <BookOpen className="h-8 w-8 shrink-0 text-cyan-400/80" aria-hidden />
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key={`loading-${selectedExam}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 flex justify-center"
            >
              <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
            </motion.div>
          ) : (
            <motion.div
              key={`tree-${selectedExam}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {exam.categories.length === 0 ? (
                <p className="mt-16 text-center text-sm text-zinc-500">
                  Brak zadań w bazie dla tego egzaminu. Uruchom{" "}
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                    npm run seed:trening-tasks
                  </code>{" "}
                  lub dodaj zadania w Supabase.
                </p>
              ) : filteredExam.categories.length === 0 ? (
                <EmptyState
                  className="mt-16"
                  icon={Search}
                  title={
                    debouncedQuery.trim()
                      ? "Brak pasujących tematów"
                      : topicFilter === "completed"
                        ? "Brak ukończonych tematów"
                        : topicFilter === "incomplete"
                          ? "Wszystko ukończone!"
                          : "Brak tematów do wyświetlenia"
                  }
                  description={
                    debouncedQuery.trim()
                      ? `Nie znaleziono tematów dla „${debouncedQuery.trim()}”. Spróbuj innej frazy.`
                      : topicFilter === "completed"
                        ? "Rozwiąż zadania w arenie, aby ukończyć pierwsze tematy."
                        : topicFilter === "incomplete"
                          ? "Wszystkie aktywne tematy są ukończone — gratulacje! 🎉"
                          : "Zmień filtr lub wyszukiwanie, aby zobaczyć tematy."
                  }
                />
              ) : (
                filteredExam.categories.map((category, index) => (
                  <CategorySection
                    key={category.id}
                    examKey={selectedExam}
                    category={category}
                    index={index}
                    highlightTopicHref={
                      showPathBanner ? pathBannerHref : null
                    }
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-12 pb-2 text-center text-xs text-zinc-500">
          ⏳ brak zadań w bazie · ▶️ w trakcie · ✅ ukończone — slugi zgodne z
          Supabase (category / topic)
        </p>
      </div>
    </div>
  );
}
