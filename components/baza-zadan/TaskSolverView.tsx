"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { getRelatedTasks, getTaskById } from "@/lib/baza-zadan/catalog";
import { answersEquivalent } from "@/lib/math/answer-equiv";
import { useLearningPath } from "@/components/LearningPathProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaskSolverViewProps = {
  id: string;
};

export function TaskSolverView({ id }: TaskSolverViewProps) {
  const { path } = useLearningPath();
  const { isSolved, markSolved, recordResult, ready } = useSolvedTasks();
  const task = getTaskById(id);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!task || !ready) return;
    if (isSolved(task.id)) {
      // Restore solved state when the task or solved set changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(task.correctIndex);
      setShowExplanation(true);
    } else {
      setPicked(null);
      setShowExplanation(false);
    }
  }, [task, ready, isSolved, id]);

  if (!task) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center">
        <p className="text-xl font-black text-white">Nie znaleziono zadania</p>
        <Link href="/baza-zadan" className="mt-4 inline-block text-orange-400">
          ← Baza zadań
        </Link>
      </div>
    );
  }

  const related = getRelatedTasks(task, path);
  const answered = picked !== null;
  const isCorrect =
    picked !== null &&
    answersEquivalent(task.choices[picked], task.choices[task.correctIndex]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-zinc-500 hover:text-orange-400"       >
        ← Baza zadań
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-300">
          {CATEGORY_LABELS[task.category]}
        </span>
        <span className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
        {task.examSource && (
          <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-bold text-amber-400">
            {task.examSource.sessionLabel ?? task.examSource.year}
            {task.examSource.taskNumber
              ? ` · zad. ${task.examSource.taskNumber}`
              : ""}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black text-white">{task.title}</h1>
        {isSolved(task.id) && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
            ✓ Rozwiązane
          </span>
        )}
      </div>

      <div className="mt-8 rounded-3xl border border-orange-500/20 bg-zinc-900/90 p-6 sm:p-8">
        <p className="text-lg font-semibold text-zinc-300">{task.prompt}</p>
        {task.hint && !answered && (
          <p className="mt-3 text-sm text-zinc-500">💡 {task.hint}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {task.choices.map((choice, index) => {
            let style =
              "border-white/10 bg-zinc-950 hover:border-orange-500/40 hover:bg-orange-500/10";
            if (answered) {
              if (index === task.correctIndex) {
                style =
                  "border-emerald-500/60 bg-emerald-500/20 text-emerald-100";
              } else if (index === picked) {
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
                onClick={() => {
                  setPicked(index);
                  setShowExplanation(true);
                  const correct = index === task.correctIndex;
                  // Błędna odpowiedź oznacza zadanie „do powtórki" (poprawna
                  // jest no-op) — spójnie dla gościa i zalogowanego.
                  recordResult(task.id, correct);
                  if (correct) {
                    markSolved(task.id);
                  }
                }}
                className={`rounded-2xl border px-4 py-4 text-left text-base font-bold text-white transition-colors ${style}`}
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
              isCorrect
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/10"
            }`}
          >
            <p className="font-black text-white">
              {isCorrect ? "Dobrze! 🎉" : "Nie tym razem"}
            </p>
            {!isCorrect && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-300/90">
                ↻ Dodano do powtórek
              </p>
            )}
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

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-black text-white">Podobne zadania</h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/baza-zadan/${r.id}`}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isSolved(r.id)
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-orange-500/30"
                  }`}
                >
                  <span>{r.title}</span>
                  {isSolved(r.id) && (
                    <span className="text-emerald-400" aria-hidden>
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
