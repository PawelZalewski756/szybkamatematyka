"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { MathText } from "@/components/trening/MathText";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import {
  getExamSheetById,
  getTaskById,
} from "@/lib/baza-zadan/catalog";
import Link from "next/link";
import { use, useState } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ExamSheetPage({ params }: PageProps) {
  const { id } = use(params);
  const { markSolved, isSolved } = useSolvedTasks();
  const sheet = getExamSheetById(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!sheet) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center">
        <p className="text-xl font-black text-foreground">Brak arkusza</p>
        <Link href="/baza-zadan" className="mt-4 text-accent">
          ← Baza zadań
        </Link>
      </div>
    );
  }

  const taskId = sheet.taskIds[currentIndex];
  const task = taskId ? getTaskById(taskId) : undefined;
  const total = sheet.taskIds.length;
  const progress = ((currentIndex + (picked !== null ? 1 : 0)) / total) * 100;

  const handlePick = (index: number) => {
    if (picked !== null || !task) return;
    setPicked(index);
    if (index === task.correctIndex) {
      setScore((s) => s + 1);
      markSolved(task.id);
    }
  };

  const goNext = () => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setPicked(null);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-12 text-center">
        <p className="text-6xl">📋</p>
        <h1 className="mt-4 text-3xl font-black text-foreground">Koniec arkusza!</h1>
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

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted hover:text-accent"       >
        ← Baza zadań
      </Link>

      <div className="mt-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-foreground">{sheet.title}</h1>
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
          {isSolved(task.id) && (
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
            {task.explanation.trim() && (
              <div className="text-sm text-muted">
                <TheoryMarkdown
                  content={formatCkeMathText(task.explanation)}
                  variant="solution"
                />
              </div>
            )}
            {task.solutionSteps && task.solutionSteps.length > 0 && (
              <SolutionSteps
                steps={task.solutionSteps}
                examLabel={task.examSource?.sessionLabel}
              />
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
    </div>
  );
}
