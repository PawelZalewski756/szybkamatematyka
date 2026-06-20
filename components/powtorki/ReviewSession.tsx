"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { answersEquivalent } from "@/lib/math/answer-equiv";
import type { ReviewSessionSummary } from "@/lib/powtorki/types";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type ReviewSessionProps = {
  taskIds: readonly string[];
  onComplete: (summary: ReviewSessionSummary) => void;
  onExit: () => void;
};

export function ReviewSession({
  taskIds,
  onComplete,
  onExit,
}: ReviewSessionProps) {
  const { grade } = useReview();

  // Kolejka sesji: pomijamy ID, których nie ma już w katalogu.
  const initialQueue = useMemo(
    () => taskIds.filter((id) => getTaskById(id)),
    [taskIds],
  );

  const [queue, setQueue] = useState<string[]>(() => [...initialQueue]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>(
    {},
  );
  const [retried, setRetried] = useState<Set<string>>(new Set());

  const totalUnique = initialQueue.length;
  const answeredUnique = Object.keys(firstResults).length;

  const finish = useCallback(
    (results: Record<string, boolean>) => {
      const values = Object.values(results);
      const correct = values.filter(Boolean).length;
      onComplete({
        total: values.length,
        correct,
        wrong: values.length - correct,
      });
    },
    [onComplete],
  );

  const currentId = queue[index];
  const task = currentId ? getTaskById(currentId) : undefined;
  const answered = picked !== null;
  const isCorrect =
    task && picked !== null
      ? answersEquivalent(task.choices[picked], task.choices[task.correctIndex])
      : false;

  const handlePick = (choiceIndex: number) => {
    if (!task || answered) return;
    setPicked(choiceIndex);
    const correct =
      picked !== null &&
      answersEquivalent(
        task.choices[choiceIndex],
        task.choices[task.correctIndex],
      );
    grade(task.id, correct);

    setFirstResults((prev) =>
      task.id in prev ? prev : { ...prev, [task.id]: correct },
    );

    if (!correct && !retried.has(task.id)) {
      setRetried((prev) => new Set(prev).add(task.id));
      setQueue((prev) => [...prev, task.id]);
    }
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      finish(firstResults);
      return;
    }
    setIndex(nextIndex);
    setPicked(null);
  };

  if (!task) {
    // Brak zadań do pokazania (np. wszystkie usunięte z katalogu).
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-lg font-bold text-zinc-200">
          Brak zadań do powtórki
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-6 text-sm font-bold text-orange-400 hover:text-orange-200"
        >
          ← Wróć do panelu
        </button>
      </div>
    );
  }

  const progressPct =
    totalUnique > 0
      ? Math.min(100, Math.round((answeredUnique / totalUnique) * 100))
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:py-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 transition hover:text-orange-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Przerwij
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {Math.min(answeredUnique + 1, totalUnique)} / {totalUnique}
        </span>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-500"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${task.id}-${index}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-300">
              {CATEGORY_LABELS[task.category]}
            </span>
            <span className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
              {DIFFICULTY_LABELS[task.difficulty]}
            </span>
          </div>

          <div className="mt-4 rounded-3xl border border-orange-500/20 bg-zinc-900/90 p-6 sm:p-8">
            <h2 className="text-xl font-black text-white">{task.title}</h2>
            <div className="mt-3">
              <TheoryMarkdown content={task.prompt} />
            </div>
            {task.hint && !answered && (
              <p className="mt-3 text-sm text-zinc-500">💡 {task.hint}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {task.choices.map((choice, choiceIndex) => {
                let style =
                  "border-white/10 bg-zinc-950 hover:border-orange-500/40 hover:bg-orange-500/10";
                if (answered) {
                  if (choiceIndex === task.correctIndex) {
                    style =
                      "border-emerald-500/60 bg-emerald-500/20 text-emerald-100";
                  } else if (choiceIndex === picked) {
                    style = "border-red-500/60 bg-red-500/20 text-red-100";
                  } else {
                    style = "border-white/5 bg-zinc-900/50 opacity-50";
                  }
                }

                return (
                  <motion.button
                    key={choice}
                    type="button"
                    disabled={answered}
                    onClick={() => handlePick(choiceIndex)}
                    className={`relative rounded-2xl border px-4 py-4 text-left text-base font-bold text-white transition-colors ${style}`}
                    whileTap={answered ? undefined : { scale: 0.98 }}
                  >
                    {choice}
                    {answered && choiceIndex === task.correctIndex && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
                    )}
                    {answered &&
                      choiceIndex === picked &&
                      choiceIndex !== task.correctIndex && (
                        <XCircle className="absolute right-3 top-3 h-5 w-5 text-red-400" />
                      )}
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-2xl border p-4 ${
                  isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-red-500/40 bg-red-500/10"
                }`}
              >
                <p className="font-black text-white">
                  {isCorrect ? "Dobrze! 🎉" : "Wróci do powtórki wkrótce"}
                </p>
                <p className="mt-2 text-sm text-zinc-300">{task.explanation}</p>
                {task.solutionSteps && task.solutionSteps.length > 0 && (
                  <SolutionSteps
                    steps={task.solutionSteps}
                    examLabel={task.examSource?.sessionLabel}
                  />
                )}
              </motion.div>
            )}
          </div>

          {answered && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-6 inline-flex items-center justify-center gap-2 self-end rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/90 to-orange-600/90 px-6 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(232,112,42,0.2)] transition hover:scale-[1.02]"
            >
              {index + 1 >= queue.length ? "Zakończ" : "Następne"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
