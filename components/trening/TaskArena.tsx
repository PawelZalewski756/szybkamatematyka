"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import { TopicVictoryScreen } from "@/components/trening/TopicVictoryScreen";
import {
  awardArenaXp,
  ensureUserProfile,
  type Profile,
} from "@/lib/supabase/profiles";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  fetchSolvedTaskIds,
  markTaskSolved,
} from "@/lib/supabase/solved-tasks";
import { checkAnswerMatch, fetchTasksByTopic } from "@/lib/supabase/tasks";
import { stripChoiceLabelPrefix } from "@/lib/math/render-math-text";
import type { ExamType, Task } from "@/types/database";
import { AnimatePresence, motion } from "framer-motion";
import { DifficultyBadge } from "@/components/trening/DifficultyBadge";
import { MathText } from "@/components/trening/MathText";
import { TaskAiPanel } from "@/components/trening/TaskAiPanel";
import { TaskContent } from "@/components/trening/TaskContent";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Shuffle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type DifficultyFilter = "all" | 1 | 2 | 3;

function shuffleTasks<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const CORRECT_DELAY_MS = 1500;
const WRONG_UNLOCK_MS = 700;

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: "Matura podstawowa",
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": "Egzamin 8-klasisty",
};

type TaskWithOptions = Task & { options: string[] };

type TaskArenaProps = {
  examType: ExamType;
  category: string;
  topic: string;
  topicLabel: string;
  backHref: string;
  /** Ukrywa nagłówek (powrót + etykieta) — np. w zakładce areny na stronie tematu. */
  compactChrome?: boolean;
};

function fireConfetti() {
  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#22d3ee", "#d946ef", "#a78bfa", "#34d399"],
      disableForReducedMotion: true,
    });
  });
}

export function TaskArena({
  examType,
  category,
  topic,
  topicLabel,
  backHref,
  compactChrome = false,
}: TaskArenaProps) {
  const [loading, setLoading] = useState(true);
  const [taskPool, setTaskPool] = useState<TaskWithOptions[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [shuffleOrder, setShuffleOrder] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [guestHint, setGuestHint] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [localCheckWrong, setLocalCheckWrong] = useState(false);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<string | null>(
    null,
  );
  const [topicHasTasks, setTopicHasTasks] = useState(false);
  const { recordResult } = useSolvedTasks();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setActionError(null);

    try {
      const supabase = getSupabaseOrNull();
      const [rows, sessionResult] = await Promise.all([
        fetchTasksByTopic(examType, category, topic),
        supabase
          ? supabase.auth.getSession()
          : Promise.resolve({ data: { session: null } }),
      ]);

      let solvedIds = new Set<string>();
      const {
        data: { session },
      } = sessionResult;
      const user = session?.user;

      if (user) {
        setUserId(user.id);
        const [loadedSolvedIds, loadedProfile] = await Promise.all([
          fetchSolvedTaskIds(user.id),
          ensureUserProfile(user).catch((err) => {
            console.error("[szybka-matma] TaskArena profile:", err);
            return null;
          }),
        ]);
        solvedIds = loadedSolvedIds;
        if (loadedProfile?.nick) setProfile(loadedProfile);
      } else {
        setUserId(null);
        setProfile(null);
      }

      const unsolved = user
        ? rows.filter((t) => !solvedIds.has(t.id))
        : rows;

      setTopicHasTasks(rows.length > 0);
      setTaskPool(unsolved);
      setDifficultyFilter("all");
      setShuffleOrder(false);
      setIndex(0);
      setFinished(false);
      setAttempts({});
      setSelected(null);
      setFeedback(null);
      setAnswerLocked(false);
    } catch {
      setLoadError("Nie udało się załadować zadań.");
      setTaskPool([]);
    } finally {
      setLoading(false);
    }
  }, [examType, category, topic]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTasks();
  }, [loadTasks]);

  const tasks = useMemo(() => {
    let list =
      difficultyFilter === "all"
        ? taskPool
        : taskPool.filter((t) => t.difficulty === difficultyFilter);
    if (shuffleOrder && list.length > 1) {
      list = shuffleTasks(list);
    }
    return list;
  }, [taskPool, difficultyFilter, shuffleOrder]);

  useEffect(() => {
    // Reset the run when filters change (intentional state reset).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
    setFinished(false);
    setAttempts({});
    setSelected(null);
    setTypedAnswer("");
    setFeedback(null);
    setAnswerLocked(false);
  }, [difficultyFilter, shuffleOrder]);

  const current = tasks[index];
  const total = tasks.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypedAnswer("");
    setSelected(null);
    setFeedback(null);
    setAnswerLocked(false);
    setLocalCheckWrong(false);
    setLastSubmittedAnswer(null);
  }, [current?.id]);

  const progressLabel = useMemo(() => {
    if (finished) return "Ukończono";
    if (!current) return "";
    return `Zadanie ${index + 1} z ${total}`;
  }, [finished, current, index, total]);

  const advanceOrFinish = useCallback(() => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTypedAnswer("");
      setFeedback(null);
      setAnswerLocked(false);
    }
  }, [index, total]);

  const completeCorrectAnswer = useCallback(
    async (option: string) => {
      if (!current) return;

      setAnswerLocked(true);
      setActionError(null);
      setSelected(option);
      setFeedback("correct");
      setLocalCheckWrong(false);

      if (getTaskById(current.id)) {
        recordResult(current.id, true);
      }

      const taskAttempts = (attempts[current.id] ?? 0) + 1;
      setAttempts((prev) => ({ ...prev, [current.id]: taskAttempts }));

      let awarded = false;

      if (userId) {
        setAwarding(true);
        try {
          const firstSolve = await markTaskSolved(userId, current.id);
          if (firstSolve && profile?.nick) {
            const halfXp = taskAttempts > 1;
            const xpGain = halfXp
              ? Math.max(1, Math.floor(current.xp_reward / 2))
              : current.xp_reward;
            const updated = await awardArenaXp(profile, xpGain);
            setProfile(updated);
            setXpFlash(xpGain);
            setTimeout(() => setXpFlash(null), 1800);
            awarded = true;
          }
        } catch (err) {
          console.error("[szybka-matma] TaskArena award:", err);
          setActionError(
            "Nie udało się zapisać postępu. XP może nie zostać naliczone.",
          );
        } finally {
          setAwarding(false);
        }
      } else {
        setGuestHint(true);
      }

      if (awarded || !userId) {
        fireConfetti();
      }

      window.setTimeout(() => {
        advanceOrFinish();
      }, current.explanation ? 8_000 : CORRECT_DELAY_MS);
    },
    [
      advanceOrFinish,
      attempts,
      current,
      profile,
      recordResult,
      userId,
    ],
  );

  const handleAnswer = async (option: string) => {
    if (!current || answerLocked || awarding || feedback === "correct") return;

    setAnswerLocked(true);
    setActionError(null);

    const isCorrect = checkAnswerMatch(option, current.correct_answer);

    setSelected(option);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (getTaskById(current.id)) {
      recordResult(current.id, isCorrect);
    }

    if (!isCorrect) {
      setShakeKey((k) => k + 1);
      const isOpen = current.options.length === 0;
      if (isOpen) {
        setLastSubmittedAnswer(option);
        setLocalCheckWrong(true);
        window.setTimeout(() => {
          setFeedback(null);
          setAnswerLocked(false);
        }, WRONG_UNLOCK_MS);
      } else {
        window.setTimeout(() => {
          setSelected(null);
          setFeedback(null);
          setAnswerLocked(false);
        }, WRONG_UNLOCK_MS);
      }
      return;
    }

    await completeCorrectAnswer(option);
  };

  if (loading) {
    return (
      <div className="relative flex min-h-[50vh] flex-1 flex-col items-center justify-center">
        {!compactChrome && <GamingBackground />}
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-brand" />
        <p className="relative z-10 mt-3 text-sm font-semibold text-zinc-400">
          Ładowanie areny…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center py-16 text-center">
        {!compactChrome && <GamingBackground />}
        <p className="relative z-10 text-red-400">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadTasks()}
          className="relative z-10 mt-4 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-hover"
        >
          Spróbuj ponownie
        </button>
        {!compactChrome && (
          <Link
            href={backHref}
            className="relative z-10 mt-3 text-sm font-bold text-brand"
          >
            ← Wróć do treningu
          </Link>
        )}
      </div>
    );
  }

  if (!finished && tasks.length === 0) {
    if (topicHasTasks && taskPool.length > 0) {
      return (
        <div className="relative flex flex-1 flex-col items-center justify-center py-16 text-center">
          {!compactChrome && <GamingBackground />}
          <p className="relative z-10 text-lg font-bold text-zinc-200">
            Brak zadań dla wybranego filtra
          </p>
          <p className="relative z-10 mt-2 max-w-sm text-sm text-zinc-400">
            Wybierz inną trudność lub „Wszystkie”, aby kontynuować sesję.
          </p>
        </div>
      );
    }
    if (!topicHasTasks) {
      return (
        <div className="relative flex flex-1 flex-col items-center justify-center py-16 text-center">
          {!compactChrome && <GamingBackground />}
          <p className="relative z-10 text-lg font-bold text-zinc-200">
            Brak zadań w tym temacie
          </p>
          <p className="relative z-10 mt-2 max-w-sm text-sm text-zinc-400">
            Zadania pojawią się po imporcie do bazy. Sprawdź zakładkę Teoria lub
            wróć później.
          </p>
          {!compactChrome && (
            <Link
              href={backHref}
              className="relative z-10 mt-6 text-sm font-bold text-brand"             >
              ← Wróć do treningu
            </Link>
          )}
        </div>
      );
    }
    return <TopicVictoryScreen backHref={backHref} />;
  }

  if (finished) {
    return <TopicVictoryScreen backHref={backHref} />;
  }

  const options =
    current.options.length > 0
      ? current.options
      : [current.correct_answer];

  const isOpenTask = current.options.length === 0;

  const showHalfXpHint =
    (attempts[current.id] ?? 0) >= 1 && feedback !== "correct";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {!compactChrome && <GamingBackground />}

      <div
        className={`relative z-10 flex flex-1 flex-col ${compactChrome ? "" : "py-6 sm:py-10"}`}
      >
        {compactChrome ? (
          <div className="mb-4 flex justify-end">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {progressLabel}
            </span>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand transition hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Trening
              </Link>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {progressLabel}
              </span>
            </div>

            <p className="mb-4 text-center text-sm font-semibold text-brand">
              {topicLabel}
            </p>
          </>
        )}

        {actionError && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-200"
          >
            {actionError}
          </p>
        )}

        {xpFlash !== null && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-center text-sm font-black text-emerald-400"
          >
            +{xpFlash} XP
          </motion.p>
        )}

        {guestHint && !userId && (
          <p className="mb-2 text-center text-xs font-semibold text-amber-300/90">
            Zaloguj się, aby zapisać postęp i zdobywać XP.
          </p>
        )}

        <div className="mb-4 flex flex-col gap-3">
          <div
            role="group"
            aria-label="Filtr trudności"
            className="flex flex-wrap justify-center gap-2"
          >
            {(
              [
                { id: "all" as const, label: "Wszystkie" },
                { id: 1 as const, label: "Łatwe (1)" },
                { id: 2 as const, label: "Średnie (2)" },
                { id: 3 as const, label: "Trudne (3)" },
              ] as const
            ).map((opt) => {
              const active = difficultyFilter === opt.id;
              return (
                <button
                  key={String(opt.id)}
                  type="button"
                  onClick={() => setDifficultyFilter(opt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : "border-surface-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <label className="mx-auto flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-400">
            <input
              type="checkbox"
              checked={shuffleOrder}
              onChange={(e) => setShuffleOrder(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-accent focus:ring-accent/40"
            />
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            Losuj kolejność
          </label>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="mx-auto flex w-full max-w-2xl flex-1 flex-col lg:max-w-3xl xl:max-w-4xl"
          >
            <div className="surface-card p-6 sm:p-8">
              <div className="mb-3 flex justify-end">
                <DifficultyBadge difficulty={current.difficulty} />
              </div>
              <TaskContent content={current.content} />
              <TaskAiPanel
                taskId={current.id}
                taskContent={current.content}
                correctAnswer={current.correct_answer}
                examLabel={EXAM_LABEL[examType]}
                topicLabel={topicLabel}
                isOpenTask={isOpenTask}
                options={current.options}
                feedback={feedback}
                showGradeOption={localCheckWrong}
                autoGrade={isOpenTask}
                studentAnswer={lastSubmittedAnswer ?? typedAnswer}
                disabled={answerLocked || awarding || feedback === "correct"}
                onAiAccepted={(answer) => void completeCorrectAnswer(answer)}
              />
            </div>

            <motion.div
              key={shakeKey}
              animate={
                feedback === "wrong"
                  ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.45 }}
              className="mt-6"
            >
              {isOpenTask ? (
                <div className="mx-auto flex max-w-md flex-col gap-3">
                  <label htmlFor="arena-answer" className="sr-only">
                    Twoja odpowiedź
                  </label>
                  <input
                    id="arena-answer"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    value={typedAnswer}
                    disabled={answerLocked || feedback === "correct" || awarding}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && typedAnswer.trim()) {
                        void handleAnswer(typedAnswer.trim());
                      }
                    }}
                    placeholder="Wpisz odpowiedź…"
                    className={`input-field w-full py-3 text-base font-medium ${
                      feedback === "correct"
                        ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : feedback === "wrong"
                          ? "border-red-500/50 ring-1 ring-red-500/30"
                          : ""
                    }`}
                  />
                  <button
                    type="button"
                    disabled={
                      !typedAnswer.trim() ||
                      answerLocked ||
                      feedback === "correct" ||
                      awarding
                    }
                    onClick={() => void handleAnswer(typedAnswer.trim())}
                    className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    Sprawdź
                  </button>
                  {feedback === "correct" && (
                    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Dobrze!
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {options.map((option, i) => {
                const label = OPTION_LABELS[i] ?? String(i + 1);
                const isSelected = selected === option;
                const isCorrectOption = checkAnswerMatch(
                  option,
                  current.correct_answer,
                );
                const showCorrect =
                  feedback === "correct" && isCorrectOption;
                const showWrong = isSelected && feedback === "wrong";

                let cardClass =
                  "group relative flex min-h-[4.5rem] w-full flex-col items-stretch rounded-xl border px-4 py-4 text-left transition-colors ";

                if (showCorrect) {
                  cardClass +=
                    "border-emerald-500/40 bg-emerald-500/15 text-emerald-50";
                } else if (showWrong) {
                  cardClass +=
                    "border-red-500/40 bg-red-500/15 text-red-50";
                } else {
                  cardClass +=
                    "border-surface-border bg-surface text-foreground hover:border-brand/30 hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    data-testid="training-answer-option"
                    data-option-index={i}
                    disabled={answerLocked || feedback === "correct" || awarding}
                    onClick={() => void handleAnswer(option)}
                    className={cardClass}
                  >
                    <span className="mb-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-xs font-semibold text-muted">
                      {label}
                    </span>
                    <span className="text-sm font-medium leading-snug sm:text-base">
                      <MathText content={stripChoiceLabelPrefix(option)} />
                    </span>
                    {showCorrect && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
                    )}
                    {showWrong && (
                      <XCircle className="absolute right-3 top-3 h-5 w-5 text-red-400" />
                    )}
                  </button>
                );
              })}
                </div>
              )}
            </motion.div>

            {feedback === "wrong" && (
              <p className="mt-4 text-center text-sm font-semibold text-red-400">
                {showHalfXpHint
                  ? "Spróbuj jeszcze raz — po poprawnej odpowiedzi dostaniesz połowę XP."
                  : "Spróbuj jeszcze raz!"}
              </p>
            )}

            {feedback === "correct" && (
              <div className="mt-4">
                <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Dobra odpowiedź!
                </p>
                {current.explanation && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-300">
                      Rozwiązanie
                    </p>
                    <MathText
                      as="div"
                      content={current.explanation}
                      className="whitespace-pre-line text-sm font-medium leading-relaxed text-foreground"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
