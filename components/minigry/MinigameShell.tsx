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
  hudShadow: string;
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
      <div className="flex flex-1 items-center justify-center py-20 text-muted">
        Ładowanie konta…
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={`/minigry/modes/${modeConfig.slug}`}
          className="text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          ← {modeConfig.title}
        </Link>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          <p className={`text-sm font-bold uppercase tracking-widest ${theme.label}`}>
            {modeConfig.badge} · Minigra
          </p>
          <h1 className="mt-2 text-4xl font-black text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-muted">{description}</p>
          <p className="mt-2 text-sm text-muted">{modeDescription(mode)}</p>

          <motion.div className="mt-8 w-full">
            <AccountLevelBar
              level={displayProgress.level}
              xp={displayProgress.xp}
              subtitle={
                account.profile?.nick ?? "Zaloguj się, by zapisywać postęp"
              }
            />
            <p className="mt-3 text-sm text-muted">
              Teraz:{" "}
              <span className={`font-semibold ${theme.tryText}`}>
                {pathLabel}
              </span>
              {" · "}
              <span className="text-muted">{questionTrackLabel}</span>
            </p>
          </motion.div>

          <motion.button
            type="button"
            onClick={() => {
              startGame();
              onStart();
            }}
            className="btn-chunky mt-10 w-full py-5 text-xl"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Rozpocznij
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
              className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
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
                <h2 className="mt-4 text-3xl font-black text-accent sm:text-4xl">
                  NOWY POZIOM KONTA!
                </h2>
                <p className="mt-3 text-2xl font-black text-foreground">
                  Poz. {cloudProfile?.level ?? displayProgress.level}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className={`text-sm font-bold uppercase tracking-widest ${theme.label}`}>
          {pathLabel} · {questionTrackLabel} · {modeConfig.title}
        </p>
        <h1 className="mt-2 text-5xl font-black text-foreground sm:text-6xl">
          Koniec gry!
        </h1>
        <p className="mt-6 text-2xl text-muted">
          Punkty w rundzie:{" "}
          <span className="font-black text-accent">🏆 {score}</span>
        </p>
        {mode === "marathon" && (
          <p className="mt-2 text-lg text-accent">
            Czas: {formatElapsed(elapsedTime)}
          </p>
        )}
        {mode === "survival" && (
          <p className="mt-2 text-lg text-muted">
            Poprawnych odpowiedzi: {questionsAnswered}
          </p>
        )}
        {account.isLoggedIn && cloudProfile ? (
          <p className="mt-2 text-lg text-success">
            {savedToCloud
              ? `+${xpEarned} XP na koncie (wynik rundy: ${score} pkt) · Poz. ${cloudProfile.level}`
              : saveError ?? "Zapisywanie XP…"}
          </p>
        ) : (
          <p className="mt-2 text-lg text-accent">
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
            subtitle={cloudProfile?.nick ?? "Niezalogowany"}
          />
        </div>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              returnToStart();
              onPlayAgain();
            }}
            className="btn-chunky flex-1 px-8 py-4 text-lg"
          >
            Zagraj ponownie
          </button>
          <Link
            href="/minigry"
            className="btn-chunky-soft flex-1 px-8 py-4 text-lg"
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
            className="pointer-events-none fixed inset-0 z-50 bg-success/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}
        {flash === "wrong" && (
          <motion.div
            key="flash-wrong"
            className="pointer-events-none fixed inset-0 z-50 bg-danger/40"
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
            className="shrink-0 text-sm font-semibold text-muted transition-colors hover:text-accent"
          >
            ← {modeConfig.title}
          </Link>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${theme.badge}`}
          >
            {pathLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 game-hud px-3 py-3 sm:px-4">
          <div className="min-w-0 flex-1">
            {mode === "time_attack" && (
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Time Attack
              </p>
            )}
            {mode === "survival" && (
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Survival · {questionsAnswered} poprawnych
              </p>
            )}
            {mode === "marathon" && (
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Pytanie {Math.min(questionsAnswered + 1, marathonTotal)}/
                {marathonTotal}
              </p>
            )}
          </div>

          <div
            className={`shrink-0 whitespace-nowrap text-3xl font-black tabular-nums sm:text-4xl ${
              isLowTime
                ? "animate-pulse text-danger"
                : mode === "marathon"
                  ? "text-accent"
                  : mode === "survival"
                    ? "text-muted"
                    : "text-foreground"
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
                    className="whitespace-nowrap flex-shrink-0 rounded-full border border-accent/50 bg-accent/20 px-2 py-0.5 text-xs font-black text-accent"
                  >
                    🔥 Seria ×{combo}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.div
                className="whitespace-nowrap flex-shrink-0 text-lg font-black text-accent sm:text-xl"
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
                className="text-xs font-bold text-success"
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
              className={`game-surface px-4 py-12 text-center sm:px-6 sm:py-16 ${theme.hudShadow}`}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.22 }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
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
