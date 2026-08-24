"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { useReview } from "@/components/powtorki/ReviewProvider";
import {
  CATEGORY_LABELS,
} from "@/lib/baza-zadan/labels";
import { answersEquivalent } from "@/lib/math/answer-equiv";
import { resolveReviewTask } from "@/lib/powtorki/resolve-task";
import type { TaskCategory } from "@/lib/baza-zadan/types";
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
  const { grade, getItem } = useReview();

  // Kolejka sesji: pomijamy ID, których nie ma już w katalogu.
  const initialQueue = useMemo(
    () =>
      taskIds.filter((id) => {
        const item = getItem(id) ?? { taskId: id };
        return Boolean(resolveReviewTask(item));
      }),
    [taskIds, getItem],
  );

  const [queue, setQueue] = useState<string[]>(() => [...initialQueue]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
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
  const currentItem = currentId ? getItem(currentId) : undefined;
  const task = currentItem
    ? resolveReviewTask(currentItem)
    : currentId
      ? resolveReviewTask({ taskId: currentId })
      : null;
  const isOpen = Boolean(task && task.choices.length === 0);
  const answered = picked !== null;
  const isCorrect =
    task && picked !== null
      ? answersEquivalent(
          isOpen ? typedAnswer : task.choices[picked],
          task.correctAnswer,
        )
      : false;

  const handlePick = (choiceIndex: number) => {
    if (!task || answered) return;
    setPicked(choiceIndex);
    const correct = answersEquivalent(
      isOpen ? typedAnswer : task.choices[choiceIndex],
      task.correctAnswer,
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
    setTypedAnswer("");
  };

  if (!task) {
    // Brak zadań do pokazania (np. wszystkie usunięte z katalogu).
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-lg font-bold text-foreground">
          Brak zadań do powtórki
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-6 text-sm font-bold text-accent hover:text-accent"
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
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Przerwij
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-muted">
          {Math.min(answeredUnique + 1, totalUnique)} / {totalUnique}
        </span>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="progress-accent"
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
            <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
              {CATEGORY_LABELS[task.category as TaskCategory] ?? task.category}
            </span>
            <span className="rounded-md border border-surface-border bg-surface-hover px-2 py-1 text-xs font-bold text-foreground">
              {task.difficulty === 1
                ? "Łatwe"
                : task.difficulty === 2
                  ? "Średnie"
                  : "Trudne"}
            </span>
          </div>

          <div className="mt-4 rounded-3xl border border-accent/20 bg-surface/90 p-6 sm:p-8">
            <h2 className="text-xl font-black text-white">{task.title}</h2>
            <div className="mt-3">
              <TheoryMarkdown content={task.prompt} />
            </div>
            {task.hint && !answered && (
              <p className="mt-3 text-sm text-muted">💡 {task.hint}</p>
            )}

            {isOpen ? (
              <div className="mt-6 flex gap-2">
                <label htmlFor="review-answer" className="sr-only">
                  Twoja odpowiedź
                </label>
                <input
                  id="review-answer"
                  value={typedAnswer}
                  disabled={answered}
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && typedAnswer.trim()) {
                      handlePick(0);
                    }
                  }}
                  className="input-field min-w-0 flex-1 px-3 py-2"
                  placeholder="Wpisz odpowiedź…"
                />
                <button
                  type="button"
                  disabled={!typedAnswer.trim() || answered}
                  onClick={() => handlePick(0)}
                  className="btn-primary px-4 py-2 disabled:opacity-50"
                >
                  Sprawdź
                </button>
              </div>
            ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {task.choices.map((choice, choiceIndex) => {
                let style =
                  "border-surface-border bg-background hover:border-accent/40 hover:bg-accent/10";
                if (answered) {
                  if (answersEquivalent(choice, task.correctAnswer)) {
                    style =
                      "border-success/60 bg-success/20 text-success";
                  } else if (choiceIndex === picked) {
                    style = "border-red-500/60 bg-red-500/20 text-red-100";
                  } else {
                    style = "border-surface-border bg-surface/50 opacity-50";
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
                    {answered && answersEquivalent(choice, task.correctAnswer) && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-success" />
                    )}
                    {answered &&
                      choiceIndex === picked &&
                      !answersEquivalent(choice, task.correctAnswer) && (
                        <XCircle className="absolute right-3 top-3 h-5 w-5 text-red-400" />
                      )}
                  </motion.button>
                );
              })}
            </div>
            )}

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-2xl border p-4 ${
                  isCorrect
                    ? "border-success/40 bg-success/10"
                    : "border-red-500/40 bg-red-500/10"
                }`}
              >
                <p className="font-black text-white">
                  {isCorrect ? "Dobrze! 🎉" : "Wróci do powtórki wkrótce"}
                </p>
                <p className="mt-2 text-sm text-foreground">{task.explanation}</p>
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
              className="btn-chunky mt-6 inline-flex items-center justify-center gap-2 self-end px-6 py-3 text-sm"
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
