"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import { useGameAccount } from "@/lib/minigry/use-game-account";
import {
  accuracyPercent,
  formatDuration,
} from "@/lib/pojedynki/duel-engine";
import { awardDuelXp, previewDuelXp } from "@/lib/pojedynki/duel-rewards";
import { recordDuelOutcome } from "@/lib/supabase/duel-results";
import type {
  DuelDeliveryMode,
  DuelOpponentInfo,
  DuelOutcome,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function fireConfetti() {
  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    });
    window.setTimeout(
      () =>
        confetti({
          particleCount: 70,
          spread: 100,
          origin: { y: 0.5 },
          disableForReducedMotion: true,
        }),
      250,
    );
  });
}

const OUTCOME_COPY: Record<
  DuelOutcome,
  { title: string; emoji: string; accent: string }
> = {
  win: {
    title: "Wygrana!",
    emoji: "🏆",
    accent: "from-emerald-400 via-cyan-400 to-fuchsia-400",
  },
  draw: {
    title: "Remis!",
    emoji: "🤝",
    accent: "from-amber-400 via-orange-400 to-rose-400",
  },
  loss: {
    title: "Porażka",
    emoji: "💪",
    accent: "from-sky-400 via-indigo-400 to-violet-400",
  },
};

function ScoreCard({
  name,
  result,
  highlight,
}: {
  name: string;
  result: DuelResult;
  highlight: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-2xl border p-4 text-center ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-white/10 bg-zinc-900/80"
      }`}
    >
      <p className="truncate text-sm font-bold text-zinc-300">{name}</p>
      <p className="mt-2 text-3xl font-black text-amber-400">🏆 {result.score}</p>
      <p className="mt-1 text-sm text-zinc-400">
        {result.correct}/{result.total} · {accuracyPercent(result)}%
      </p>
      <p className="mt-0.5 text-xs text-cyan-300">
        {formatDuration(result.durationMs)}
      </p>
    </div>
  );
}

type DuelResultScreenProps = {
  outcome: DuelOutcome;
  myName: string;
  opponent: DuelOpponentInfo;
  myResult: DuelResult;
  opponentResult: DuelResult;
  /** Minigra rozegrana w pojedynku (do statystyk/historii). */
  slug: string;
  /** Tryb realizacji pojedynku (online/na kod/lokalny/bot). */
  mode: DuelDeliveryMode;
  /** Czy zapisywać XP (np. tylko realny pojedynek, nie trening z botem łatwym). */
  awardXp?: boolean;
  onRematch: () => void;
};

export function DuelResultScreen({
  outcome,
  myName,
  opponent,
  myResult,
  opponentResult,
  slug,
  mode,
  awardXp = true,
  onRematch,
}: DuelResultScreenProps) {
  const { account } = useGameAccount();
  const copy = OUTCOME_COPY[outcome];
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [savedLevel, setSavedLevel] = useState<number | null>(null);
  const appliedRef = useRef(false);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (outcome === "win" || outcome === "draw") fireConfetti();
  }, [outcome]);

  // Trwały zapis wyniku pojedynku (statystyki + historia). Liczymy tylko realne
  // pojedynki rywalizacyjne (awardXp) — pomijamy hot-seat (dwóch graczy na jednym
  // urządzeniu) i trening z łatwym botem. Dla gościa zapis trafia do localStorage,
  // dla zalogowanego dodatkowo do Supabase (profiles.duel_* + duel_results).
  useEffect(() => {
    if (!awardXp || recordedRef.current) return;
    if (account === null) return; // czekamy, aż stan konta się ustali
    recordedRef.current = true;
    void recordDuelOutcome({
      userId: account.profile?.id ?? null,
      outcome,
      myResult,
      opponentResult,
      mode,
      slug,
    }).catch(() => {
      /* zapis statystyk jest best-effort — nie blokuje UI wyniku */
    });
  }, [account, awardXp, outcome, myResult, opponentResult, mode, slug]);

  useEffect(() => {
    if (!awardXp || appliedRef.current) return;
    if (!account?.isLoggedIn || !account.profile) return;
    appliedRef.current = true;
    const profile = account.profile;
    void awardDuelXp(profile, myResult, outcome)
      .then((summary) => {
        setXpEarned(summary.xpEarned);
        setSavedLevel(summary.level);
      })
      .catch(() => {
        setXpEarned(null);
      });
  }, [account, awardXp, myResult, outcome]);

  const previewXp = previewDuelXp(myResult, outcome);
  const iAmHighlighted = outcome === "win";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <motion.p
        initial={{ scale: 0.5, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="text-7xl"
      >
        {copy.emoji}
      </motion.p>
      <h1
        className={`mt-3 bg-gradient-to-r ${copy.accent} bg-clip-text text-4xl font-black text-transparent sm:text-5xl`}
      >
        {copy.title}
      </h1>

      <div className="mt-8 flex w-full items-stretch gap-3">
        <ScoreCard
          name={`${myName} (Ty)`}
          result={myResult}
          highlight={iAmHighlighted}
        />
        <div className="flex items-center text-xl font-black text-zinc-600">
          VS
        </div>
        <ScoreCard
          name={opponent.name}
          result={opponentResult}
          highlight={outcome === "loss"}
        />
      </div>

      {awardXp && account?.isLoggedIn && account.profile ? (
        <div className="mt-6 w-full">
          <p className="mb-3 text-lg font-bold text-emerald-400">
            {xpEarned !== null
              ? `+${xpEarned} XP na koncie${
                  savedLevel ? ` · LVL ${savedLevel}` : ""
                }`
              : "Zapisywanie XP…"}
          </p>
          <AccountLevelBar
            level={account.profile.level}
            xp={account.profile.xp}
            subtitle={account.profile.nick}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-amber-400">
          {awardXp ? (
            <>
              <Link href="/login" className="font-bold underline">
                Zaloguj się
              </Link>
              , aby zapisać {previewXp} XP z pojedynku.
            </>
          ) : (
            "Trening z botem — bez zapisu XP."
          )}
        </p>
      )}

      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRematch}
          className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-500/40 transition-transform hover:scale-105 active:scale-95"
        >
          Jeszcze raz
        </button>
        <Link
          href="/minigry"
          className="flex-1 rounded-2xl border border-white/20 px-8 py-4 text-lg font-black text-white transition-colors hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10"
        >
          Minigry
        </Link>
      </div>
    </div>
  );
}
