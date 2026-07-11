"use client";

import type { DuelProgress } from "@/lib/pojedynki/duel-types";
import { motion } from "framer-motion";

type Row = {
  name: string;
  progress: DuelProgress | null;
  variant?: "me" | "opponent";
  pending?: string;
};

function ProgressRow({ row, total }: { row: Row; total: number }) {
  const answered = row.progress?.answered ?? 0;
  const score = row.progress?.score ?? 0;
  const percent = total > 0 ? Math.min(100, (answered / total) * 100) : 0;
  const finished = row.progress?.finished ?? false;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-bold text-foreground">
          {row.name}
          {finished && <span className="ml-1 text-success">✓</span>}
        </span>
        <span className="shrink-0 font-black tabular-nums text-accent">
          🏆 {score}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-hover">
        <motion.div
          className={`h-full rounded-full ${
            row.variant === "me" ? "progress-accent" : "bg-muted/40"
          }`}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="mt-1 text-xs text-muted">
        {row.progress
          ? `${answered}/${total} pytań`
          : (row.pending ?? "Czeka…")}
      </p>
    </div>
  );
}

export function DuelProgressBars({
  total,
  me,
  opponent,
}: {
  total: number;
  me: Row;
  opponent: Row;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-surface-border bg-surface/80 p-4 backdrop-blur-sm sm:grid-cols-2">
      <ProgressRow row={me} total={total} />
      <ProgressRow row={opponent} total={total} />
    </div>
  );
}
