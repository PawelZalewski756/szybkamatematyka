"use client";

import { AddTasksPicker } from "@/components/powtorki/AddTasksPicker";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import { describeNextReview, isDue } from "@/lib/powtorki/scheduler";
import { motion } from "framer-motion";
import { Brain, CalendarClock, Loader2, Play, Trash2 } from "lucide-react";
import { useMemo } from "react";

type ReviewDashboardProps = {
  onStart: () => void;
};

export function ReviewDashboard({ onStart }: ReviewDashboardProps) {
  const { ready, items, dueCount, totalCount, removeFromReview } = useReview();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [items]);

  const upcomingCount = totalCount - dueCount;

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
          Po
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            wtórki
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-400">
          Inteligentne powtórki w systemie spaced repetition. Utrwalaj zadania,
          z którymi miałeś problem — wracają dokładnie wtedy, gdy zaczynasz je
          zapominać.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-zinc-900/80 to-orange-500/10 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
              <Brain className="h-3.5 w-3.5" />
              Do powtórki dziś
            </div>
            <p className="mt-3 text-5xl font-black text-white tabular-nums">
              {dueCount}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-400">
              {dueCount === 0
                ? "Brak zaległych powtórek — super!"
                : dueCount === 1
                  ? "zadanie czeka na powtórkę"
                  : "zadań czeka na powtórkę"}
            </p>
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={dueCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-4 text-base font-black text-white shadow-[0_0_32px_rgba(232,112,42,0.25)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <Play className="h-5 w-5" />
            Rozpocznij sesję
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:max-w-md">
          <div>
            <p className="text-2xl font-black text-white tabular-nums">
              {totalCount}
            </p>
            <p className="text-xs font-semibold text-zinc-400">
              wszystkich w powtórkach
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-white tabular-nums">
              {upcomingCount}
            </p>
            <p className="text-xs font-semibold text-zinc-400">
              zaplanowanych na później
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-black text-white">Twoja talia powtórek</h2>
          {sortedItems.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-6 text-sm text-zinc-400">
              Nic tu jeszcze nie ma. Dodaj zadania po prawej, a my zajmiemy się
              harmonogramem powtórek.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sortedItems.map((item) => {
                const task = getTaskById(item.taskId);
                const due = isDue(item);
                return (
                  <li key={item.taskId}>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-100">
                          {task?.title ?? "Zadanie niedostępne"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span
                            className={
                              due ? "text-amber-400" : "text-zinc-500"
                            }
                          >
                            {due
                              ? "do powtórki teraz"
                              : `następna: ${describeNextReview(item)}`}
                          </span>
                          {task && (
                            <span className="text-zinc-600">
                              · {CATEGORY_LABELS[task.category]}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromReview(item.taskId)}
                        aria-label="Usuń z powtórek"
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 p-2 text-zinc-500 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <AddTasksPicker />
      </div>
    </div>
  );
}
