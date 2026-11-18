"use client";

import { MathText } from "@/components/trening/MathText";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  buildDiagnosticResult,
  saveDiagnosticResult,
  type DiagnosticResult,
  type DiagnosticTask,
} from "@/lib/diagnostyka";
import { learningPathLabel, type LearningPath } from "@/lib/learning-path";
import { recordTaskCompletion } from "@/lib/progress/task-completion";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DiagnosticQuizProps = {
  tasksByPath: Record<LearningPath, DiagnosticTask[]>;
};

const PATH_OPTIONS: LearningPath[] = ["sp", "srednia"];

function pathLabel(path: LearningPath): string {
  return path === "sp" ? "Egzamin ósmoklasisty" : "Matura podstawowa";
}

export function DiagnosticQuiz({ tasksByPath }: DiagnosticQuizProps) {
  const { path: preferredPath } = useLearningPath();
  const [path, setPath] = useState<LearningPath>(preferredPath);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const tasks = tasksByPath[path] ?? [];
  const task = tasks[index];
  const answered = selected !== null;
  const isLast = index === tasks.length - 1;

  const start = () => {
    setStarted(true);
    setIndex(0);
    setSelected(null);
    setAnswers({});
    setResult(null);
  };

  const choose = (choiceIndex: number) => {
    if (!task || answered) return;
    setSelected(choiceIndex);
    setAnswers((current) => ({
      ...current,
      [task.id]: choiceIndex === task.correctIndex,
    }));
    if (choiceIndex === task.correctIndex) {
      void recordTaskCompletion({
        taskId: task.id,
        source: "diagnoza",
        isCorrect: true,
        xpReward: 10,
      });
    }
  };

  const next = () => {
    if (!answered) return;
    if (!isLast) {
      setIndex((current) => current + 1);
      setSelected(null);
      return;
    }
    const nextResult = buildDiagnosticResult(path, tasks, answers);
    setResult(nextResult);
    saveDiagnosticResult(nextResult);
  };

  const reset = () => {
    setStarted(false);
    setIndex(0);
    setSelected(null);
    setAnswers({});
    setResult(null);
  };

  if (!started && !result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-overline">Diagnoza startowa</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Sprawdź, od czego zacząć
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          8 krótkich pytań z różnych działów. Po wyniku zobaczysz, które obszary
          wymagają powtórki, i przejdziesz do odpowiedniego treningu.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PATH_OPTIONS.map((option) => {
            const active = path === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setPath(option)}
                aria-pressed={active}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-accent/60 bg-accent-soft/50 text-foreground"
                    : "border-surface-border bg-surface text-muted hover:border-accent/40"
                }`}
              >
                <span className="block text-sm font-bold">{pathLabel(option)}</span>
                <span className="mt-1 block text-xs">
                  {tasksByPath[option].length} pytań
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={tasks.length === 0}
          className="btn-chunky mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50"
        >
          Rozpocznij diagnozę
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        <p className="mt-3 text-xs text-muted">
          Wynik zapisuje się lokalnie w przeglądarce. Nie wymaga konta.
        </p>
      </div>
    );
  }

  if (result) {
    const percent =
      result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
    const weakest = [...result.categories].sort(
      (a, b) => a.correct / a.total - b.correct / b.total,
    )[0];

    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-overline">Wynik diagnozy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {percent}% poprawnych
        </h1>
        <p className="mt-2 text-sm text-muted">
          {result.correct} z {result.total} pytań · {pathLabel(result.path)}
        </p>

        <div className="mt-6 space-y-2 rounded-2xl border border-surface-border bg-surface p-5">
          {result.categories.map((category) => {
            const ratio = category.total > 0 ? category.correct / category.total : 0;
            return (
              <div key={category.category} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm font-semibold text-foreground">
                  {category.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-muted">
                  {category.correct}/{category.total}
                </span>
              </div>
            );
          })}
        </div>

        {weakest ? (
          <p className="mt-4 text-sm text-muted">
            Najwięcej do powtórki:{" "}
            <strong className="text-foreground">{weakest.label}</strong>.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/trening" className="btn-chunky inline-flex items-center gap-2 px-5 py-3 text-sm">
            Przejdź do treningu
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/baza-zadan"
            className="inline-flex items-center rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
          >
            Baza zadań
          </Link>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-3 py-3 text-sm font-semibold text-muted transition hover:text-accent"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Powtórz diagnozę
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted">Brak pytań dla wybranego poziomu.</p>
        <button type="button" onClick={reset} className="mt-4 text-sm font-bold text-accent">
          Wróć
        </button>
      </div>
    );
  }

  const chosenCorrect = selected === task.correctIndex;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          Pytanie {index + 1} z {tasks.length} · {task.categoryLabel}
        </span>
        <span>{pathLabel(path)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${((index + (answered ? 1 : 0)) / tasks.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-surface-border bg-surface p-5 sm:p-7">
        <MathText content={task.prompt} as="div" className="text-lg font-semibold leading-relaxed" />
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {task.choices.map((choice, choiceIndex) => {
            let style =
              "border-surface-border bg-background text-foreground hover:border-accent/50";
            if (answered) {
              if (choiceIndex === task.correctIndex) {
                style = "border-success/60 bg-success/15 text-foreground";
              } else if (choiceIndex === selected) {
                style = "border-danger/60 bg-danger/15 text-foreground";
              } else {
                style = "border-surface-border bg-surface text-muted opacity-60";
              }
            }
            return (
              <button
                key={`${choice}-${choiceIndex}`}
                type="button"
                disabled={answered}
                onClick={() => choose(choiceIndex)}
                data-testid="diagnostic-choice"
                className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${style}`}
              >
                <MathText content={choice} />
              </button>
            );
          })}
        </div>

        {answered ? (
          <p
            className="mt-4 flex items-center gap-2 text-sm font-bold"
            aria-live="polite"
            data-testid="diagnostic-feedback"
          >
            {chosenCorrect ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                <span className="text-success">Dobrze</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-danger" aria-hidden />
                <span className="text-danger">Nie tym razem</span>
              </>
            )}
          </p>
        ) : null}

        <button
          type="button"
          onClick={next}
          disabled={!answered}
          data-testid="diagnostic-next"
          className="btn-chunky mt-5 flex w-fit items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {isLast ? "Pokaż wynik" : "Następne pytanie"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        {learningPathLabel(path)} · diagnoza nie jest oceną, tylko wskazówką.
      </p>
    </div>
  );
}
