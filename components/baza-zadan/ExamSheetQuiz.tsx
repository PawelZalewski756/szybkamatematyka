"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { ProGate } from "@/components/subscription/ProGate";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { MathText } from "@/components/trening/MathText";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import type { QuizTask } from "@/lib/baza-zadan/quiz-task";
import { useSubscription } from "@/lib/subscription/use-subscription";
import {
  fetchTaskSolution,
  type TaskSolution,
} from "@/lib/trening/task-assist-client";
import Link from "next/link";
import { useState } from "react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Props = {
  sheetId: string;
  title: string;
  tasks: QuizTask[];
};

export function ExamSheetQuiz({ sheetId, title, tasks }: Props) {
  const { markSolved, isSolved } = useSolvedTasks();
  const { isPro } = useSubscription();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  // Zadania rozwiązane dopiero w tej sesji - nie są "wcześniej rozwiązane".
  const [solvedNow, setSolvedNow] = useState<ReadonlySet<string>>(new Set());
  const [solution, setSolution] = useState<TaskSolution | null>(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  const total = tasks.length;
  const task = tasks[currentIndex];

  if (total === 0) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center text-muted">
        Ten arkusz nie ma jeszcze zadań.
      </div>
    );
  }

  async function loadSolution(taskId: string) {
    if (!isPro || solution || solutionLoading) return;
    setSolutionLoading(true);
    setSolutionError(null);
    try {
      setSolution(await fetchTaskSolution(taskId));
    } catch (error) {
      setSolutionError(
        error instanceof Error
          ? error.message
          : "Nie udało się pobrać rozwiązania.",
      );
    } finally {
      setSolutionLoading(false);
    }
  }

  function handlePick(index: number) {
    if (picked !== null || !task) return;
    setPicked(index);
    if (index === task.correctIndex) {
      setScore((s) => s + 1);
      if (!isSolved(task.id)) {
        setSolvedNow((prev) => new Set(prev).add(task.id));
      }
      markSolved(task.id);
    }
  }

  function goNext() {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setPicked(null);
    setSolution(null);
    setSolutionError(null);
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-12 text-center">
        <p className="text-6xl">📋</p>
        <h1 className="mt-4 text-3xl font-black text-foreground">
          Koniec arkusza!
        </h1>
        <p className="mt-4 text-xl text-muted">
          Wynik:{" "}
          <span className="font-black text-success">
            {score}/{total}
          </span>{" "}
          ({pct}%)
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setPicked(null);
              setScore(0);
              setFinished(false);
              setSolution(null);
            }}
            className="btn-primary rounded-2xl py-4 text-base"
          >
            Powtórz arkusz
          </button>
          <Link
            href="/baza-zadan"
            className="rounded-2xl border border-surface-border py-4 font-black text-foreground"
          >
            Wróć do bazy
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center text-muted">
        Ładowanie zadania…
      </div>
    );
  }

  const progress = ((currentIndex + (picked !== null ? 1 : 0)) / total) * 100;
  const correctLetter =
    !task.choices.some((choice) => /zadanie otwarte/i.test(choice))
      ? (LETTERS[task.correctIndex] ?? null)
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        ← Baza zadań
      </Link>

      <div className="mt-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-foreground">{title}</h1>
        <span className="text-sm font-bold text-accent">
          {currentIndex + 1}/{total}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-surface-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TaskTresc
            tresc={task.prompt}
            className="text-lg font-semibold text-foreground"
          />
          {isSolved(task.id) && !solvedNow.has(task.id) && (
            <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
              ✓ wcześniej rozwiązane
            </span>
          )}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {task.choices.map((choice, index) => (
            <button
              key={choice}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(index)}
              className={`rounded-2xl border px-4 py-3 text-left font-bold text-foreground transition-colors ${
                picked === null
                  ? "border-surface-border bg-surface hover:border-accent/40"
                  : index === task.correctIndex
                    ? "border-success/50 bg-success/20"
                    : index === picked
                      ? "border-danger/50 bg-danger/20"
                      : "border-surface-border opacity-40"
              }`}
            >
              <MathText content={formatCkeMathText(choice)} />
            </button>
          ))}
        </div>

        {picked !== null && (
          <div className="mt-6">
            {correctLetter && (
              <p className="text-sm font-bold text-foreground">
                Poprawna odpowiedź: {correctLetter}
              </p>
            )}

            {task.hasSolution ? (
              isPro ? (
                solution ? (
                  <div className="mt-4 space-y-3">
                    {solution.explanation.trim() ? (
                      <TheoryMarkdown
                        content={formatCkeMathText(solution.explanation)}
                        variant="solution"
                      />
                    ) : null}
                    <SolutionSteps steps={solution.steps} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void loadSolution(task.id)}
                    disabled={solutionLoading}
                    className="mt-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-bold text-accent"
                  >
                    {solutionLoading
                      ? "Pobieram rozwiązanie…"
                      : "Pokaż rozwiązanie krok po kroku"}
                  </button>
                )
              ) : (
                <div className="mt-3">
                  <ProGate featureLabel="Rozwiązanie krok po kroku">
                    {null}
                  </ProGate>
                </div>
              )
            ) : null}

            {solutionError && (
              <p className="mt-3 text-sm text-danger">{solutionError}</p>
            )}

            <button
              type="button"
              onClick={goNext}
              className="btn-primary mt-4 w-full rounded-2xl py-3 text-base"
            >
              {currentIndex + 1 >= total ? "Zakończ arkusz" : "Następne zadanie"}
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        Arkusz {sheetId} · wynik zapisuje się w Twoim postępie.
      </p>
    </div>
  );
}
