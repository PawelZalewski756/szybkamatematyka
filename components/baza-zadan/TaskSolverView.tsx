"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { ProGate } from "@/components/subscription/ProGate";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { getClientRelatedTasks } from "@/lib/baza-zadan/client-catalog";
import type { Task } from "@/lib/baza-zadan/types";
import { answersEquivalent } from "@/lib/math/answer-equiv";
import { useLearningPath } from "@/components/LearningPathProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { canViewFullSolutions } from "@/lib/subscription/content-limits";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaskSolverViewProps = {
  task: Task;
};

export function TaskSolverView({ task }: TaskSolverViewProps) {
  const { path } = useLearningPath();
  const { isPro } = useSubscription();
  const { isSolved, markSolved, recordResult, ready } = useSolvedTasks();
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!task || !ready) return;
    if (isSolved(task.id) && task.correctIndex !== null) {
      // Restore solved state when the task or solved set changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(task.correctIndex);
      setShowExplanation(true);
    } else {
      setPicked(null);
      setShowExplanation(false);
    }
  }, [task, ready, isSolved]);

  const related = getClientRelatedTasks(task, path);
  const answered = picked !== null;
  const correctIndex = task.correctIndex;
  const isGraded = correctIndex !== null;
  const isCorrect =
    correctIndex !== null &&
    picked !== null &&
    answersEquivalent(task.choices[picked], task.choices[correctIndex]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted hover:text-accent"       >
        ← Baza zadań
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
          {CATEGORY_LABELS[task.category]}
        </span>
        <span className="rounded-md border border-surface-border bg-surface-hover px-2 py-1 text-xs font-bold text-muted">
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
        {task.examSource && (
          <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
            {task.examSource.sessionLabel ?? task.examSource.year}
            {task.examSource.taskNumber
              ? ` · zad. ${task.examSource.taskNumber}`
              : ""}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black text-foreground">{task.title}</h1>
        {isSolved(task.id) && (
          <span className="rounded-full border border-success/40 bg-success/15 px-3 py-1 text-xs font-bold text-success">
            ✓ Rozwiązane
          </span>
        )}
      </div>

      <div className="mt-8 rounded-3xl border border-surface-border bg-surface p-6 sm:p-8">
        <p className="text-lg font-semibold text-foreground">{task.prompt}</p>
        {task.hint && !answered && (
          <p className="mt-3 text-sm text-muted">💡 {task.hint}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {task.choices.map((choice, index) => {
            let style =
              "border-surface-border bg-surface hover:border-accent/40 hover:bg-accent/10";
            if (answered) {
              if (!isGraded && index === picked) {
                style = "border-accent/50 bg-accent/10 text-foreground";
              } else if (index === correctIndex) {
                style =
                  "border-success/60 bg-success/20 text-foreground";
              } else if (index === picked) {
                style = "border-danger/60 bg-danger/20 text-foreground";
              } else {
                style = "border-surface-border bg-surface opacity-50";
              }
            }

            return (
              <motion.button
                key={choice}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(index);
                  setShowExplanation(true);
                  if (!isGraded) return;
                  const correct = index === correctIndex;
                  // Błędna odpowiedź oznacza zadanie „do powtórki" (poprawna
                  // jest no-op) — spójnie dla gościa i zalogowanego.
                  recordResult(task.id, correct);
                  if (correct) {
                    markSolved(task.id);
                  }
                }}
                className={`rounded-2xl border px-4 py-4 text-left text-base font-bold text-foreground transition-colors ${style}`}
                whileTap={answered ? undefined : { scale: 0.98 }}
              >
                {choice}
              </motion.button>
            );
          })}
        </div>

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-2xl border p-4 ${
              !isGraded
                ? "border-accent/40 bg-accent/10"
                : isCorrect
                ? "border-success/40 bg-success/10"
                : "border-danger/40 bg-danger/10"
            }`}
          >
            <p className="font-black text-foreground">
              {!isGraded
                ? "Sprawdź rozwiązanie"
                : isCorrect
                  ? "Dobrze! 🎉"
                  : "Nie tym razem"}
            </p>
            {isGraded && !isCorrect && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent">
                ↻ Dodano do powtórek
              </p>
            )}
            <p className="mt-2 text-sm text-muted">{task.explanation}</p>
            {task.solutionSteps && task.solutionSteps.length > 0 && (
              canViewFullSolutions(isPro) ? (
                <SolutionSteps
                  steps={task.solutionSteps}
                  examLabel={task.examSource?.sessionLabel}
                />
              ) : (
                <ProGate featureLabel="Rozwiązania krok po kroku">
                  <SolutionSteps
                    steps={task.solutionSteps}
                    examLabel={task.examSource?.sessionLabel}
                  />
                </ProGate>
              )
            )}
          </motion.div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-black text-foreground">Podobne zadania</h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/baza-zadan/${r.id}`}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isSolved(r.id)
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-surface-border bg-surface text-foreground hover:border-accent/40"
                  }`}
                >
                  <span>{r.title}</span>
                  {isSolved(r.id) && (
                    <span className="text-success" aria-hidden>
                      ✓
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
