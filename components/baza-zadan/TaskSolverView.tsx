"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { MathText } from "@/components/trening/MathText";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { ProGate } from "@/components/subscription/ProGate";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import {
  examTaskPoints,
  expectedOpenAnswer,
  formatPkt,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { getRelatedTasks, getTaskById } from "@/lib/baza-zadan/catalog";
import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import { answersEquivalent, checkAnswerMatch } from "@/lib/math/answer-equiv";
import { useLearningPath } from "@/components/LearningPathProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { canViewFullSolutions } from "@/lib/subscription/content-limits";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { fetchTaskGrade } from "@/lib/trening/task-assist-client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaskSolverViewProps = {
  id: string;
};

function resolveAwardedPoints(
  result: TaskGradeResult,
  maxPoints: number,
): number {
  if (result.awardedPoints != null) {
    return Math.min(maxPoints, Math.max(0, result.awardedPoints));
  }
  if (result.verdict === "correct") return maxPoints;
  if (result.verdict === "partial") return Math.max(1, Math.floor(maxPoints / 2));
  return 0;
}

export function TaskSolverView({ id }: TaskSolverViewProps) {
  const { path } = useLearningPath();
  const { isPro, isLoggedIn } = useSubscription();
  const { isSolved, markSolved, recordResult, ready } = useSolvedTasks();
  const task = getTaskById(id);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [openGrade, setOpenGrade] = useState<TaskGradeResult | null>(null);
  const [openAwarded, setOpenAwarded] = useState<number | null>(null);

  const open = task ? isOpenExamTask(task) : false;
  const maxPoints = task ? examTaskPoints(task) : 1;

  useEffect(() => {
    if (!task || !ready) return;
    if (isSolved(task.id)) {
      // Restore solved state when the task or solved set changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowExplanation(true);
      if (isOpenExamTask(task)) {
        const pts = examTaskPoints(task);
        setOpenAwarded(pts);
        setOpenGrade({
          verdict: "correct",
          feedback: "To zadanie masz już rozwiązane.",
          acceptAsCorrect: true,
          awardedPoints: pts,
        });
      } else {
        setPicked(task.correctIndex);
      }
    } else {
      setPicked(null);
      setShowExplanation(false);
      setTypedAnswer("");
      setOpenGrade(null);
      setOpenAwarded(null);
      setGradeError(null);
    }
  }, [task, ready, isSolved, id]);

  if (!task) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center">
        <p className="text-xl font-black text-foreground">Nie znaleziono zadania</p>
        <Link href="/baza-zadan" className="mt-4 inline-block text-accent">
          ← Baza zadań
        </Link>
      </div>
    );
  }

  const related = getRelatedTasks(task, path);
  const nextTask = related.find((r) => !isSolved(r.id)) ?? related[0] ?? null;
  const answeredClosed = picked !== null;
  const isCorrectClosed =
    picked !== null &&
    answersEquivalent(task.choices[picked], task.choices[task.correctIndex]);
  const openAccepted = openGrade?.acceptAsCorrect === true;
  const showResult = open ? showExplanation || openGrade != null : answeredClosed;

  async function handleOpenCheck() {
    if (!task) return;
    const answer = typedAnswer.trim();
    if (!answer || grading) return;

    setGrading(true);
    setGradeError(null);
    setOpenGrade(null);

    const expected = expectedOpenAnswer(task);

    if (checkAnswerMatch(answer, expected)) {
      const result: TaskGradeResult = {
        verdict: "correct",
        feedback: "Odpowiedź zgadza się z kluczem.",
        acceptAsCorrect: true,
        awardedPoints: maxPoints,
      };
      setOpenGrade(result);
      setOpenAwarded(maxPoints);
      setShowExplanation(true);
      recordResult(task.id, true);
      markSolved(task.id);
      setGrading(false);
      return;
    }

    try {
      const { grade } = await fetchTaskGrade({
        taskId: task.id,
        taskContent: formatCkeMathText(task.prompt),
        correctAnswer: expected,
        studentAnswer: answer,
        examLabel: task.examSource?.sessionLabel,
        topicLabel: CATEGORY_LABELS[task.category],
        maxPoints,
        markingNotes: task.solutionSteps
          ?.map((step) => formatCkeMathText(step))
          .join("\n"),
      });
      const awarded = resolveAwardedPoints(grade, maxPoints);
      setOpenGrade(grade);
      setOpenAwarded(awarded);
      setShowExplanation(true);
      recordResult(task.id, grade.acceptAsCorrect);
      if (grade.acceptAsCorrect) {
        markSolved(task.id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się ocenić odpowiedzi.";
      setGradeError(message);
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        ← Baza zadań
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
          {CATEGORY_LABELS[task.category]}
        </span>
        <span className="rounded-md border border-surface-border bg-surface-hover px-2 py-1 text-xs font-bold text-muted">
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
        <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-200">
          {formatPkt(maxPoints)}
          {open ? " · otwarte" : ""}
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
        <TaskTresc tresc={task.prompt} className="text-lg font-semibold text-foreground" />
        {task.hint && !showResult && (
          <p className="mt-3 text-sm text-muted">💡 {task.hint}</p>
        )}

        {open ? (
          <div className="mt-6 space-y-3">
            <label htmlFor="open-answer" className="text-sm font-bold text-foreground">
              Twoja odpowiedź
            </label>
            <textarea
              id="open-answer"
              value={typedAnswer}
              disabled={openAccepted || grading}
              onChange={(event) => setTypedAnswer(event.target.value)}
              rows={4}
              placeholder="Wpisz wynik, uzasadnienie albo oba podpunkty…"
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"
            />
            <button
              type="button"
              disabled={!typedAnswer.trim() || grading || openAccepted}
              onClick={() => void handleOpenCheck()}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-on-accent disabled:opacity-50"
            >
              {grading ? "Sprawdzam…" : "Sprawdź odpowiedź"}
            </button>
            {!isLoggedIn && (
              <p className="text-xs text-muted">
                Jeśli zapis różni się od klucza,{" "}
                <Link href="/login" className="font-semibold text-accent hover:underline">
                  zaloguj się
                </Link>
                , żeby otrzymać dodatkową ocenę odpowiedzi.
              </p>
            )}
            {gradeError && (
              <p role="alert" className="text-sm font-semibold text-amber-200">
                {gradeError}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {task.choices.map((choice, index) => {
              let style =
                "border-surface-border bg-surface hover:border-accent/40 hover:bg-accent/10";
              if (answeredClosed) {
                if (index === task.correctIndex) {
                  style = "border-success/60 bg-success/20 text-foreground";
                } else if (index === picked) {
                  style = "border-danger/60 bg-danger/20 text-foreground";
                } else {
                  style = "border-surface-border bg-surface opacity-50";
                }
              }

              return (
                <motion.button
                  key={`${choice}-${index}`}
                  type="button"
                  disabled={answeredClosed}
                  onClick={() => {
                    setPicked(index);
                    setShowExplanation(true);
                    const correct = index === task.correctIndex;
                    recordResult(task.id, correct);
                    if (correct) {
                      markSolved(task.id);
                    }
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left text-base font-bold text-foreground transition-colors ${style}`}
                  whileTap={answeredClosed ? undefined : { scale: 0.98 }}
                >
                  <MathText
                    content={formatCkeMathText(choice)}
                    className="[&_.katex]:text-[1em]"
                  />
                </motion.button>
              );
            })}
          </div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-2xl border p-4 ${
              (open ? openAccepted : isCorrectClosed)
                ? "border-success/40 bg-success/10"
                : openGrade?.verdict === "partial"
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-danger/40 bg-danger/10"
            }`}
          >
            <p className="font-black text-foreground">
              {open
                ? openGrade?.verdict === "correct"
                  ? "Dobrze! 🎉"
                  : openGrade?.verdict === "partial"
                    ? "Częściowo"
                    : "Nie tym razem"
                : isCorrectClosed
                  ? "Dobrze! 🎉"
                  : "Nie tym razem"}
            </p>
            {open && openAwarded != null && (
              <p className="mt-1 text-sm font-bold text-foreground">
                {formatPkt(openAwarded)} / {formatPkt(maxPoints)}
              </p>
            )}
            {!open && !isCorrectClosed && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent">
                ↻ Dodano do powtórek
              </p>
            )}
            {open && openGrade && !openAccepted && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent">
                ↻ Dodano do powtórek
              </p>
            )}
            {open && openGrade && (
              <MathText
                content={openGrade.feedback}
                as="div"
                className="mt-2 text-sm text-muted"
              />
            )}
            {!open && task.explanation.trim() && (
              <div className="mt-2 text-sm text-muted">
                <TheoryMarkdown
                  content={formatCkeMathText(task.explanation)}
                  variant="solution"
                />
              </div>
            )}
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

      {showResult && nextTask && (
        <Link
          href={`/baza-zadan/${nextTask.id}`}
          data-testid="next-task"
          className="btn-primary mt-6 flex w-full items-center justify-center px-6 py-3 text-sm"
        >
          Następne zadanie →
        </Link>
      )}

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
