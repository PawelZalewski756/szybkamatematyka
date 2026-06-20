"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { useDailyChallenge } from "@/lib/wyzwania/use-daily-challenge";
import { DAILY_CHALLENGE_QUESTION_COUNT } from "@/lib/wyzwania/daily-challenge";
import type { ChallengeReward } from "@/lib/wyzwania/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
  Swords,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "intro" | "playing" | "reward";

const FEEDBACK_MS = 650;

function fireConfetti() {
  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22d3ee", "#d946ef", "#a78bfa", "#34d399", "#fb923c"],
      disableForReducedMotion: true,
    });
  });
}

function streakNoun(days: number): string {
  if (days === 1) return "dzień z rzędu";
  return "dni z rzędu";
}

function StreakBanner({
  streak,
  bestStreak,
  completed,
}: {
  streak: number;
  bestStreak: number;
  completed: boolean;
}) {
  const active = streak > 0;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/5 p-4 backdrop-blur-md shadow-[0_0_24px_rgba(251,146,60,0.12)]">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_0_18px_rgba(251,146,60,0.4)]"
            : "bg-zinc-800"
        }`}
      >
        <Flame
          className={`h-6 w-6 ${active ? "text-white" : "text-zinc-500"}`}
          aria-hidden
        />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-white tabular-nums">
          {streak}{" "}
          <span className="text-sm font-bold text-zinc-400">
            {streakNoun(streak)}
          </span>
        </p>
        <p className="text-xs font-semibold text-zinc-400">
          {completed
            ? "Seria podtrzymana — wróć jutro!"
            : active
              ? "Ukończ dziś, by nie stracić serii"
              : "Ukończ wyzwanie, by rozpocząć serię"}
        </p>
      </div>
      {bestStreak > 0 && bestStreak > streak && (
        <div className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            Rekord
          </p>
          <p className="text-sm font-black text-amber-400 tabular-nums">
            {bestStreak}
          </p>
        </div>
      )}
    </div>
  );
}

function RewardScreen({
  reward,
  streak,
  isLoggedIn,
}: {
  reward: ChallengeReward | null;
  streak: number;
  isLoggedIn: boolean;
}) {
  const correct = reward?.correct ?? 0;
  const total = reward?.total ?? DAILY_CHALLENGE_QUESTION_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-xl sm:p-8"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-500 shadow-[0_0_28px_rgba(232,112,42,0.35)]">
        <CheckCircle2 className="h-9 w-9 text-white" aria-hidden />
      </div>
      <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
        Wyzwanie ukończone!
      </h2>
      <p className="mt-1 text-sm font-semibold text-zinc-400">
        Poprawne odpowiedzi:{" "}
        <span className="text-emerald-400">
          {correct}/{total}
        </span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center justify-center gap-1.5 text-orange-400">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Nagroda XP
            </span>
          </div>
          <p className="mt-1 text-2xl font-black text-white tabular-nums sm:text-3xl">
            +{reward?.xp ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center justify-center gap-1.5 text-orange-400">
            <Flame className="h-4 w-4" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Seria
            </span>
          </div>
          <p className="mt-1 text-2xl font-black text-white tabular-nums sm:text-3xl">
            {streak}
          </p>
        </div>
      </div>

      {reward?.leveledUp && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-sm font-black text-amber-300">
          <Trophy className="h-4 w-4" aria-hidden />
          Nowy poziom!
        </div>
      )}

      {!isLoggedIn && (
        <p className="mt-5 text-xs font-semibold text-zinc-500">
          <Link href="/login" className="font-bold text-orange-400">
            Zaloguj się
          </Link>{" "}
          — by zapisać XP na koncie i synchronizować serię między urządzeniami.
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300">
        <CalendarCheck className="h-4 w-4 text-orange-400" aria-hidden />
        Następne wyzwanie jutro
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/minigry"
          className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 transition hover:text-orange-300"
        >
          <Swords className="h-4 w-4" />
          Zagraj w minigry →
        </Link>
        <Link
          href="/trening"
          className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 transition hover:text-orange-200"
        >
          <Trophy className="h-4 w-4" />
          Trening →
        </Link>
      </div>
    </motion.div>
  );
}

export function DailyChallengeView() {
  const {
    loading,
    challenge,
    completed,
    streak,
    bestStreak,
    reward,
    isLoggedIn,
    pathLabel,
    trackLabel,
    complete,
  } = useDailyChallenge();

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (completed && !submittedRef.current) setPhase("reward");
  }, [loading, completed]);

  const questions = challenge?.questions ?? [];
  const total = questions.length;
  const current = questions[index];

  const finish = useCallback(
    async (finalCorrect: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSaving(true);
      try {
        await complete(finalCorrect, total);
        fireConfetti();
      } finally {
        setSaving(false);
        setPhase("reward");
      }
    },
    [complete, total],
  );

  const handleAnswer = (answerTrue: boolean) => {
    if (locked || !current) return;
    const isRight = answerTrue === current.isTrue;
    const nextCorrect = correctCount + (isRight ? 1 : 0);

    setLocked(true);
    setFeedback(isRight ? "correct" : "wrong");
    if (isRight) setCorrectCount(nextCorrect);

    window.setTimeout(() => {
      setFeedback(null);
      setLocked(false);
      if (index + 1 >= total) {
        void finish(nextCorrect);
      } else {
        setIndex((prev) => prev + 1);
      }
    }, FEEDBACK_MS);
  };

  const startChallenge = () => {
    submittedRef.current = false;
    setIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setLocked(false);
    setPhase("playing");
  };

  const progressPercent = total > 0 ? (index / total) * 100 : 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <GamingBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col py-8 sm:py-12">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400/90">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Dzienne wyzwanie
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Wyzwanie na dziś
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {pathLabel} · {trackLabel} · {total || DAILY_CHALLENGE_QUESTION_COUNT}{" "}
            pytań · ten sam zestaw dla wszystkich danego dnia
          </p>
        </motion.header>

        {loading ? (
          <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
            <p className="text-sm font-semibold text-zinc-400">
              Ładowanie wyzwania…
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-1 flex-col gap-5">
            <StreakBanner
              streak={streak}
              bestStreak={bestStreak}
              completed={completed || phase === "reward"}
            />

            <AnimatePresence mode="wait">
              {phase === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8"
                >
                  <div className="flex items-center gap-2 text-orange-400">
                    <Sparkles className="h-5 w-5" aria-hidden />
                    <span className="text-sm font-bold uppercase tracking-wide">
                      Oceń: prawda czy fałsz?
                    </span>
                  </div>
                  <p className="mt-3 text-base text-zinc-300">
                    Czeka na Ciebie {total} szybkich pytań. Za ukończenie
                    zdobędziesz XP i podbijesz swoją serię nauki. Wpadaj
                    codziennie, by jej nie stracić!
                  </p>
                  <button
                    type="button"
                    onClick={startChallenge}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-4 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <Flame className="h-5 w-5" />
                    Rozpocznij wyzwanie
                  </button>
                  {!isLoggedIn && (
                    <p className="mt-3 text-center text-xs font-semibold text-zinc-500">
                      Grasz jako gość — seria zapisze się lokalnie.{" "}
                      <Link href="/login" className="text-orange-400">
                        Zaloguj się
                      </Link>{" "}
                      po XP na koncie.
                    </p>
                  )}
                </motion.div>
              )}

              {phase === "playing" && current && (
                <motion.div
                  key={`q-${current.id}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>
                        Pytanie {index + 1} / {total}
                      </span>
                      <span className="tabular-nums text-emerald-400">
                        {correctCount} poprawnych
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-500 transition-[width] duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <motion.div
                    animate={
                      feedback === "wrong"
                        ? { x: [0, -8, 8, -6, 6, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.4 }}
                    className={`flex min-h-[160px] items-center justify-center rounded-3xl border p-6 text-center backdrop-blur-xl transition-colors sm:min-h-[200px] ${
                      feedback === "correct"
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : feedback === "wrong"
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-white/15 bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-3xl font-black text-white sm:text-4xl">
                      {current.claim}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => handleAnswer(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-5 text-lg font-black text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.97] disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Prawda
                    </button>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => handleAnswer(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 py-5 text-lg font-black text-red-300 transition hover:bg-red-500/20 active:scale-[0.97] disabled:opacity-60"
                    >
                      <XCircle className="h-5 w-5" />
                      Fałsz
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === "reward" && (
                <motion.div
                  key="reward"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {saving ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                    </div>
                  ) : (
                    <RewardScreen
                      reward={reward}
                      streak={streak}
                      isLoggedIn={isLoggedIn}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
