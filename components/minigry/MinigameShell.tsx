"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import {
  getModeConfig,
  modeDescription,
} from "@/lib/minigry/game-modes";
import type { useMinigameSession } from "@/lib/minigry/use-minigame-session";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

export type MinigameTheme = {
  label: string;
  badge: string;
  tryText: string;
  playButton: string;
  playShadow: string;
  hudShadow: string;
  replayButton: string;
};

type MinigameShellProps = {
  title: string;
  description: string;
  theme: MinigameTheme;
  session: ReturnType<typeof useMinigameSession>;
  onStart: () => void;
  onPlayAgain: () => void;
  questionKey: string;
  questionPrompt: string;
  questionContent: ReactNode;
  answers: ReactNode;
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MinigameShell({
  title,
  description,
  theme,
  session,
  onStart,
  onPlayAgain,
  questionKey,
  questionPrompt,
  questionContent,
  answers,
}: MinigameShellProps) {
  const {
    mode,
    account,
    accountLoading,
    pathLabel,
    questionTrackLabel,
    phase,
    score,
    timeLeft,
    elapsedTime,
    questionsAnswered,
    marathonTotal,
    combo,
    flash,
    scoreAnimating,
    setScoreAnimating,
    shake,
    setShake,
    showLevelUpOverlay,
    lastPointsGain,
    savedToCloud,
    saveError,
    xpEarned,
    cloudProfile,
    displayProgress,
    isLowTime,
    showComboBadge,
    startGame,
    returnToStart,
  } = session;

  const modeConfig = getModeConfig(mode);

  if (accountLoading || !account) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-zinc-500">
        Ładowanie konta…
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={`/minigry/modes/${modeConfig.slug}`}
          className="text-sm font-semibold text-zinc-500 transition-colors hover:text-orange-400"
        >
          ← {modeConfig.title}
        </Link>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          <p className={`text-sm font-bold uppercase tracking-widest ${theme.label}`}>
            {modeConfig.badge} · Minigra
          </p>
          <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-zinc-400">{description}</p>
          <p className="mt-2 text-sm text-zinc-500">{modeDescription(mode)}</p>

          <motion.div className="mt-8 w-full">
            <AccountLevelBar
              level={displayProgress.level}
              xp={displayProgress.xp}
              subtitle={
                account.profile?.nick ?? "Zaloguj się, by zapisywać XP"
              }
            />
            <p className="mt-3 text-sm text-zinc-500">
              Teraz:{" "}
              <span className={`font-semibold ${theme.tryText}`}>
                {pathLabel}
              </span>
              {" · "}
              <span className="text-zinc-400">{questionTrackLabel}</span>
            </p>
          </motion.div>

          <motion.button
            type="button"
            onClick={() => {
              startGame();
              onStart();
            }}
            className={`mt-10 w-full rounded-2xl bg-gradient-to-r ${theme.playButton} py-5 text-xl font-black text-white shadow-xl ${theme.playShadow}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Graj!
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
        <AnimatePresence>
          {showLevelUpOverlay && (
            <motion.div
              className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-orange-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -8 }}
                animate={{ scale: [0.5, 1.15, 1], rotate: [-8, 4, 0] }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="px-6 text-center"
              >
                <p className="text-6xl">🎉</p>
                <h2 className="mt-4 bg-gradient-to-r from-emerald-400 via-amber-500 to-orange-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                  NOWY POZIOM KONTA!
                </h2>
                <p className="mt-3 text-2xl font-black text-white">
                  LVL {cloudProfile?.level ?? displayProgress.level}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className={`text-sm font-bold uppercase tracking-widest ${theme.label}`}>
          {pathLabel} · {questionTrackLabel} · {modeConfig.title}
        </p>
        <h1 className="mt-2 text-5xl font-black text-white sm:text-6xl">
          Koniec gry!
        </h1>
        <p className="mt-6 text-2xl text-zinc-300">
          Punkty w rundzie:{" "}
          <span className="font-black text-amber-400">🏆 {score}</span>
        </p>
        {mode === "marathon" && (
          <p className="mt-2 text-lg text-amber-400">
            Czas: {formatElapsed(elapsedTime)}
          </p>
        )}
        {mode === "survival" && (
          <p className="mt-2 text-lg text-orange-300">
            Poprawnych odpowiedzi: {questionsAnswered}
          </p>
        )}
        {account.isLoggedIn && cloudProfile ? (
          <p className="mt-2 text-lg text-emerald-400">
            {savedToCloud
              ? `+${xpEarned} XP na koncie (wynik rundy: ${score} pkt) · LVL ${cloudProfile.level}`
              : saveError ?? "Zapisywanie XP…"}
          </p>
        ) : (
          <p className="mt-2 text-lg text-amber-400">
            <Link href="/login" className="font-bold underline">
              Zaloguj się
            </Link>
            , żeby zapisać postęp na koncie.
          </p>
        )}

        <div className="mt-6 w-full">
          <AccountLevelBar
            level={cloudProfile?.level ?? displayProgress.level}
            xp={cloudProfile?.xp ?? displayProgress.xp}
            subtitle={cloudProfile?.nick ?? "Gość"}
          />
        </div>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              returnToStart();
              onPlayAgain();
            }}
            className={`flex-1 rounded-2xl bg-gradient-to-r ${theme.replayButton} px-8 py-4 text-lg font-black text-white shadow-lg ${theme.playShadow} transition-transform hover:scale-105 active:scale-95`}
          >
            Zagraj ponownie
          </button>
          <Link
            href="/minigry"
            className="flex-1 rounded-2xl border border-white/20 px-8 py-4 text-lg font-black text-white transition-colors hover:border-orange-500/50 hover:bg-orange-500/10"
          >
            Inne minigry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {flash === "correct" && (
          <motion.div
            key="flash-correct"
            className="pointer-events-none fixed inset-0 z-50 bg-emerald-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}
        {flash === "wrong" && (
          <motion.div
            key="flash-wrong"
            className="pointer-events-none fixed inset-0 z-50 bg-red-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6"
        animate={shake ? { x: [0, -14, 14, -12, 12, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.38, ease: "easeInOut" }}
        onAnimationComplete={() => setShake(false)}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href={`/minigry/modes/${modeConfig.slug}`}
            className="shrink-0 text-sm font-semibold text-zinc-500 transition-colors hover:text-orange-400"
          >
            ← {modeConfig.title}
          </Link>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${theme.badge}`}
          >
            {pathLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 px-3 py-3 shadow-lg backdrop-blur-sm sm:px-4">
          <div className="min-w-0 flex-1">
            {mode === "time_attack" && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Time Attack
              </p>
            )}
            {mode === "survival" && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Survival · {questionsAnswered} poprawnych
              </p>
            )}
            {mode === "marathon" && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Pytanie {Math.min(questionsAnswered + 1, marathonTotal)}/
                {marathonTotal}
              </p>
            )}
          </div>

          <div
            className={`shrink-0 whitespace-nowrap text-3xl font-black tabular-nums sm:text-4xl ${
              isLowTime
                ? "animate-pulse text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                : mode === "marathon"
                  ? "text-amber-400"                   : mode === "survival"
                    ? "text-zinc-600"
                    : "text-white"
            }`}
          >
            {mode === "time_attack" && `${timeLeft}s`}
            {mode === "marathon" && formatElapsed(elapsedTime)}
            {mode === "survival" && "∞"}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
            <div className="flex shrink-0 items-center gap-2">
              <AnimatePresence>
                {showComboBadge && (
                  <motion.span
                    key="combo"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="whitespace-nowrap flex-shrink-0 rounded-full border border-orange-500/50 bg-orange-500/20 px-2 py-0.5 text-xs font-black text-orange-300"
                  >
                    🔥 Combo x{combo}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.div
                className="whitespace-nowrap flex-shrink-0 text-lg font-black text-amber-400 sm:text-xl"
                animate={
                  scoreAnimating ? { scale: [1, 1.45, 1] } : { scale: 1 }
                }
                transition={{ duration: 0.32 }}
                onAnimationComplete={() => setScoreAnimating(false)}
              >
                🏆 {score}
              </motion.div>
            </div>
            {lastPointsGain !== null && (
              <motion.span
                key={lastPointsGain}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -12 }}
                className="text-xs font-bold text-emerald-400"
              >
                +{lastPointsGain}
              </motion.span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-1 flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={questionKey}
              className={`rounded-3xl border bg-zinc-900/95 px-4 py-12 text-center shadow-xl sm:px-6 sm:py-16 ${theme.hudShadow}`}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.22 }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {questionPrompt}
              </p>
              {questionContent}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 pb-6">{answers}</div>
      </motion.div>
    </>
  );
}
