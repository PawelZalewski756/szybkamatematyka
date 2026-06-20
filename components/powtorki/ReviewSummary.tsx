"use client";

import type { ReviewSessionSummary } from "@/lib/powtorki/types";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useEffect } from "react";

function fireConfetti() {
  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22d3ee", "#d946ef", "#a78bfa", "#34d399", "#fb923c"],
      disableForReducedMotion: true,
    });
  });
}

type ReviewSummaryProps = {
  summary: ReviewSessionSummary;
  remainingDue: number;
  onRestart: () => void;
  onClose: () => void;
};

export function ReviewSummary({
  summary,
  remainingDue,
  onRestart,
  onClose,
}: ReviewSummaryProps) {
  const accuracy =
    summary.total > 0
      ? Math.round((summary.correct / summary.total) * 100)
      : 0;
  const perfect = summary.total > 0 && summary.wrong === 0;

  useEffect(() => {
    if (summary.total > 0) fireConfetti();
  }, [summary.total]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-12 text-center"
    >
      <motion.div
        initial={{ rotate: -8, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-500/25 via-yellow-500/10 to-amber-600/5 p-6 shadow-[0_0_48px_rgba(251,191,36,0.35)] backdrop-blur-xl"
      >
        <Trophy
          className="h-16 w-16 fill-amber-300 text-amber-400 drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]"
          aria-hidden
        />
      </motion.div>

      <h2 className="mt-8 text-2xl font-black text-amber-200 sm:text-3xl">
        {perfect ? "Bezbłędna powtórka! 🎉" : "Powtórka ukończona!"}
      </h2>
      <p className="mt-3 max-w-md text-sm font-semibold text-zinc-300 sm:text-base">
        {perfect
          ? "Wszystkie zadania za pierwszym razem — świetna robota."
          : "Materiał utrwalony. Trudniejsze zadania wrócą szybciej."}
      </p>

      <div className="mt-8 grid w-full grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-2xl font-black text-white tabular-nums">
            {summary.total}
          </p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">Zadań</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-2xl font-black text-emerald-300 tabular-nums">
            {summary.correct}
          </p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">Dobrze</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-2xl font-black text-cyan-300 tabular-nums">
            {accuracy}%
          </p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">Skuteczność</p>
        </div>
      </div>

      {remainingDue > 0 ? (
        <button
          type="button"
          onClick={onRestart}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-600/90 to-fuchsia-600/90 px-7 py-3.5 text-sm font-black text-white shadow-[0_0_32px_rgba(34,211,238,0.25)] transition hover:scale-[1.02]"
        >
          <RotateCcw className="h-4 w-4" />
          Powtarzaj dalej ({remainingDue})
        </button>
      ) : (
        <p className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-200">
          <Sparkles className="h-4 w-4" />
          Na dziś nic więcej do powtórki — wróć jutro!
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-4 text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
      >
        Wróć do panelu powtórek
      </button>
    </motion.div>
  );
}
