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
        className="rounded-full border border-accent/40 bg-accent-soft p-6 shadow-[0_0_32px_rgba(244,183,64,0.2)] backdrop-blur-xl"
      >
        <Trophy
          className="h-16 w-16 fill-amber-300 text-accent drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]"
          aria-hidden
        />
      </motion.div>

      <h2 className="mt-8 text-2xl font-black text-amber-200 sm:text-3xl">
        {perfect ? "Bezbłędna powtórka! 🎉" : "Powtórka ukończona!"}
      </h2>
      <p className="mt-3 max-w-md text-sm font-semibold text-foreground sm:text-base">
        {perfect
          ? "Wszystkie zadania za pierwszym razem — świetna robota."
          : "Materiał utrwalony. Trudniejsze zadania wrócą szybciej."}
      </p>

      <div className="mt-8 grid w-full grid-cols-3 gap-3">
        <div className="rounded-2xl border border-surface-border bg-white/[0.05] p-4">
          <p className="text-2xl font-black text-white tabular-nums">
            {summary.total}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">Zadań</p>
        </div>
        <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
          <p className="text-2xl font-black text-success tabular-nums">
            {summary.correct}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">Dobrze</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-2xl font-black text-accent tabular-nums">
            {accuracy}%
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">Skuteczność</p>
        </div>
      </div>

      {remainingDue > 0 ? (
        <button
          type="button"
          onClick={onRestart}
          className="btn-chunky mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Powtarzaj dalej ({remainingDue})
        </button>
      ) : (
        <p className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-5 py-3 text-sm font-bold text-success">
          <Sparkles className="h-4 w-4" />
          Na dziś nic więcej do powtórki — wróć jutro!
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-4 text-sm font-semibold text-muted transition hover:text-foreground"
      >
        Wróć do panelu powtórek
      </button>
    </motion.div>
  );
}
