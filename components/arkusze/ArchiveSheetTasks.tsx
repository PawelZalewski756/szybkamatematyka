"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { ProGate } from "@/components/subscription/ProGate";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import { answersEquivalent, checkAnswerMatch } from "@/lib/math/answer-equiv";
import { useSubscription } from "@/lib/subscription/use-subscription";
import {
  fetchTaskGrade,
  type AssistQuotaSnapshot,
} from "@/lib/trening/task-assist-client";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ArchiveSheetTaskData = {
  id: string;
  number: string;
  category: string;
  points: number;
  open: boolean;
  prompt: string;
  choices: string[];
  correctIndex: number;
  expected: string;
  explanation: string;
  steps: string[];
  examLabel?: string;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type SharedProps = {
  isLoggedIn: boolean;
  isPro: boolean;
  quota: AssistQuotaSnapshot | null;
  onQuota: (quota: AssistQuotaSnapshot) => void;
};

function resolveAwarded(grade: TaskGradeResult, max: number): number {
  if (grade.awardedPoints != null) {
    return Math.min(max, Math.max(0, grade.awardedPoints));
  }
  if (grade.verdict === "correct") return max;
  if (grade.verdict === "partial") return Math.max(1, Math.floor(max / 2));
  return 0;
}

function ArchiveTaskCard({
  task,
  isLoggedIn,
  isPro,
  quota,
  onQuota,
}: { task: ArchiveSheetTaskData } & SharedProps) {
  const { markSolved, recordResult } = useSolvedTasks();
  const [showSolution, setShowSolution] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [grade, setGrade] = useState<TaskGradeResult | null>(null);
  const [awarded, setAwarded] = useState<number | null>(null);

  const answered = task.open ? grade != null : picked !== null;
  const correctChoice = task.choices[task.correctIndex];

  function isChoiceCorrect(index: number) {
    return (
      index === task.correctIndex ||
      (correctChoice != null &&
        answersEquivalent(task.choices[index], correctChoice))
    );
  }

  function pick(index: number) {
    if (picked !== null) return;
    setPicked(index);
    const correct = isChoiceCorrect(index);
    recordResult(task.id, correct);
    if (correct) markSolved(task.id);
  }

  async function checkOpen() {
    const answer = typed.trim();
    if (!answer || grading) return;
    setGrading(true);
    setGradeError(null);

    if (task.expected && checkAnswerMatch(answer, task.expected)) {
      setGrade({
        verdict: "correct",
        feedback: "Odpowiedź zgadza się z kluczem.",
        acceptAsCorrect: true,
        awardedPoints: task.points,
      } as TaskGradeResult);
      setAwarded(task.points);
      recordResult(task.id, true);
      markSolved(task.id);
      setGrading(false);
      return;
    }

    try {
      const { grade: result, quota: nextQuota } = await fetchTaskGrade({
        taskId: task.id,
        taskContent: formatCkeMathText(task.prompt),
        correctAnswer: task.expected,
        studentAnswer: answer,
        examLabel: task.examLabel,
        topicLabel: task.category,
        maxPoints: task.points,
        markingNotes: task.steps.map((s) => formatCkeMathText(s)).join("\n"),
      });
      if (nextQuota) onQuota(nextQuota);
      setGrade(result);
      setAwarded(resolveAwarded(result, task.points));
      recordResult(task.id, result.acceptAsCorrect);
      if (result.acceptAsCorrect) markSolved(task.id);
    } catch (err) {
      const withQuota = err as Error & { quota?: AssistQuotaSnapshot };
      if (withQuota.quota) onQuota(withQuota.quota);
      setGradeError(
        err instanceof Error ? err.message : "Nie udało się ocenić odpowiedzi.",
      );
    } finally {
      setGrading(false);
    }
  }

  const explanationBody = task.explanation.trim() ? (
    <div className="text-sm text-muted">
      <TheoryMarkdown
        content={formatCkeMathText(task.explanation)}
        variant="solution"
      />
    </div>
  ) : null;
  const stepsBody =
    task.steps.length > 0 ? (
      <SolutionSteps steps={task.steps} examLabel={task.examLabel} />
    ) : null;

  const accepted = task.open
    ? grade?.acceptAsCorrect === true
    : picked !== null && isChoiceCorrect(picked);

  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <div className="border-b border-surface-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-accent px-2.5 py-1 text-sm font-black text-on-accent">
            Zad. {task.number}
          </span>
          <span className="rounded-lg border border-surface-border bg-surface-hover px-2 py-0.5 text-xs font-semibold text-muted">
            {task.category}
          </span>
          <span className="text-xs font-semibold text-muted">
            {task.points} pkt{task.open ? " · otwarte" : ""}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <TaskTresc tresc={task.prompt} />

        {!task.open && task.choices.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {task.choices.map((choice, index) => {
              let style = "border-surface-border bg-surface";
              if (isLoggedIn && picked === null) {
                style += " hover:border-accent/40 hover:bg-accent/10";
              }
              if (picked !== null) {
                if (isChoiceCorrect(index)) {
                  style = "border-success/60 bg-success/20";
                } else if (index === picked) {
                  style = "border-danger/60 bg-danger/20";
                } else {
                  style = "border-surface-border bg-surface opacity-50";
                }
              }
              return (
                <li key={index}>
                  <button
                    type="button"
                    disabled={!isLoggedIn || picked !== null}
                    onClick={() => pick(index)}
                    className={`flex w-full items-baseline gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${style}`}
                  >
                    <span className="font-semibold text-foreground">
                      {LETTERS[index] ?? index + 1})
                    </span>
                    <TaskTresc tresc={choice} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {task.open && isLoggedIn ? (
          <div className="mt-4 space-y-2">
            <label
              htmlFor={`open-${task.id}`}
              className="text-sm font-bold text-foreground"
            >
              Twoja odpowiedź
            </label>
            <textarea
              id={`open-${task.id}`}
              value={typed}
              rows={3}
              disabled={accepted || grading}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Wpisz wynik, uzasadnienie albo oba podpunkty…"
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"
            />
            <button
              type="button"
              disabled={!typed.trim() || grading || accepted}
              onClick={() => void checkOpen()}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-on-accent disabled:opacity-50"
            >
              {grading ? "Sprawdzam…" : "Sprawdź odpowiedź"}
            </button>
            {!isPro && quota && quota.remaining != null ? (
              <p className="text-xs text-muted">
                Darmowe sprawdzenia AI w tym miesiącu: pozostało{" "}
                {quota.remaining} z {quota.limit}.{" "}
                <Link href="/cennik" className="font-semibold text-accent">
                  Pro bez limitu
                </Link>
              </p>
            ) : null}
            {gradeError ? (
              <p role="alert" className="text-sm font-semibold text-amber-200">
                {gradeError}
              </p>
            ) : null}
          </div>
        ) : null}

        {answered ? (
          <div
            className={`mt-4 rounded-2xl border p-3 ${
              accepted
                ? "border-success/40 bg-success/10"
                : grade?.verdict === "partial"
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-danger/40 bg-danger/10"
            }`}
          >
            <p className="font-black text-foreground">
              {accepted
                ? "Dobrze!"
                : grade?.verdict === "partial"
                  ? "Częściowo"
                  : "Nie tym razem"}
              {task.open && awarded != null
                ? ` · ${awarded} / ${task.points} pkt`
                : ""}
            </p>
            {task.open && grade ? (
              <p className="mt-1 text-sm text-muted">{grade.feedback}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
            showSolution
              ? "border border-surface-border bg-surface-hover text-muted"
              : "border border-success/30 bg-success/10 text-success hover:bg-success/15"
          }`}
        >
          {showSolution ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}
        </button>

        {showSolution ? (
          <div className="mt-4 border-l-2 border-success/40 pl-4">
            <ProGate featureLabel="Rozwiązania arkuszy CKE">
              {explanationBody}
              {stepsBody}
            </ProGate>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ArchiveSheetTasks({ tasks }: { tasks: ArchiveSheetTaskData[] }) {
  const { loading, isLoggedIn, isPro } = useSubscription();
  const [quota, setQuota] = useState<AssistQuotaSnapshot | null>(null);

  return (
    <div className="mt-8 space-y-5">
      {!loading && !isLoggedIn ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 px-4 py-4 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <Lock className="h-4 w-4 text-accent" aria-hidden />
            Zaloguj się, aby zaznaczać odpowiedzi i sprawdzać zadania
          </p>
          <p className="mt-1 text-xs text-muted">
            Darmowe konto: zamknięte bez limitu, 10 sprawdzeń zadań otwartych
            przez AI w miesiącu.
          </p>
          <Link
            href="/login"
            className="btn-chunky-soft mt-3 inline-block px-4 py-2 text-sm"
          >
            Zaloguj się
          </Link>
        </div>
      ) : null}
      {tasks.map((task) => (
        <ArchiveTaskCard
          key={task.id}
          task={task}
          isLoggedIn={isLoggedIn}
          isPro={isPro}
          quota={quota}
          onQuota={setQuota}
        />
      ))}
    </div>
  );
}
