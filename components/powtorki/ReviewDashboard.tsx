"use client";

import { AddTasksPicker } from "@/components/powtorki/AddTasksPicker";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { getClientTaskById } from "@/lib/baza-zadan/client-catalog";
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
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
          Po
          <span className="text-gradient-brand">wtórki</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Inteligentne powtórki w systemie spaced repetition. Utrwalaj zadania,
          z którymi miałeś problem — wracają dokładnie wtedy, gdy zaczynasz je
          zapominać.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <Brain className="h-3.5 w-3.5" />
              Do powtórki dziś
            </div>
            <p className="mt-3 text-5xl font-black text-white tabular-nums">
              {dueCount}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
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
            className="btn-chunky inline-flex items-center justify-center gap-2 px-7 py-4 text-base disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <Play className="h-5 w-5" />
            Rozpocznij sesję
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-surface-border pt-6 sm:max-w-md">
          <div>
            <p className="text-2xl font-black text-white tabular-nums">
              {totalCount}
            </p>
            <p className="text-xs font-semibold text-muted">
              wszystkich w powtórkach
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-white tabular-nums">
              {upcomingCount}
            </p>
            <p className="text-xs font-semibold text-muted">
              zaplanowanych na później
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-black text-white">Twoja talia powtórek</h2>
          {sortedItems.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-surface-border bg-surface/60 px-4 py-6 text-sm text-muted">
              Nic tu jeszcze nie ma. Dodaj zadania po prawej, a my zajmiemy się
              harmonogramem powtórek.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sortedItems.map((item) => {
                const task = getClientTaskById(item.taskId);
                const due = isDue(item);
                return (
                  <li key={item.taskId}>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface/60 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {task?.title ?? "Zadanie niedostępne"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span
                            className={
                              due ? "text-accent" : "text-muted"
                            }
                          >
                            {due
                              ? "do powtórki teraz"
                              : `następna: ${describeNextReview(item)}`}
                          </span>
                          {task && (
                            <span className="text-muted">
                              · {CATEGORY_LABELS[task.category]}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromReview(item.taskId)}
                        aria-label="Usuń z powtórek"
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-surface-border p-2 text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
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
