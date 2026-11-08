"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { ProGate } from "@/components/subscription/ProGate";
import { MathText } from "@/components/trening/MathText";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import {
  examTaskPoints,
  expectedOpenAnswer,
  formatPkt,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import { fetchTaskGrade } from "@/lib/trening/task-assist-client";
import { answersEquivalent, checkAnswerMatch } from "@/lib/math/answer-equiv";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/baza-zadan/labels";
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
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [typedAnswer, setTypedAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [openGrade, setOpenGrade] = useState<TaskGradeResult | null>(null);
  const [openAwarded, setOpenAwarded] = useState<number | null>(null);

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
  const open = task ? isOpenExamTask(task) : false;
  const maxPoints = task ? examTaskPoints(task) : 1;
  const answered = open ? openGrade !== null : picked !== null;
  const isCorrect = open
    ? openGrade?.acceptAsCorrect === true
    : task && picked !== null
      ? answersEquivalent(task.choices[picked], task.choices[task.correctIndex])
      : false;

  const registerResult = (taskId: string, correct: boolean) => {
    grade(taskId, correct);

    setFirstResults((prev) =>
      taskId in prev ? prev : { ...prev, [taskId]: correct },
    );

    if (!correct && !retried.has(taskId)) {
      setRetried((prev) => new Set(prev).add(taskId));
      setQueue((prev) => [...prev, taskId]);
    }
  };

  const handlePick = (choiceIndex: number) => {
    if (!task || answered) return;
    setPicked(choiceIndex);
    registerResult(
      task.id,
      answersEquivalent(
        task.choices[choiceIndex],
        task.choices[task.correctIndex],
      ),
    );
  };

  const handleOpenCheck = async () => {
    if (!task) return;
    const answer = typedAnswer.trim();
    if (!answer || grading || openGrade) return;

    setGrading(true);
    setGradeError(null);
    const expected = expectedOpenAnswer(task);

    if (checkAnswerMatch(answer, expected)) {
      setOpenGrade({
        verdict: "correct",
        feedback: "Odpowiedź zgadza się z kluczem.",
        acceptAsCorrect: true,
        awardedPoints: maxPoints,
      });
      setOpenAwarded(maxPoints);
      registerResult(task.id, true);
      setGrading(false);
      return;
    }

    try {
      const { grade: result } = await fetchTaskGrade({
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
      const awarded =
        result.awardedPoints != null
          ? Math.min(maxPoints, Math.max(0, result.awardedPoints))
          : result.verdict === "correct"
            ? maxPoints
            : result.verdict === "partial"
              ? Math.max(1, Math.floor(maxPoints / 2))
              : 0;
      setOpenGrade(result);
      setOpenAwarded(awarded);
      registerResult(task.id, result.acceptAsCorrect);
    } catch (err) {
      setGradeError(
        err instanceof Error ? err.message : "Nie udało się ocenić odpowiedzi.",
      );
    } finally {
      setGrading(false);
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
    setOpenGrade(null);
    setOpenAwarded(null);
    setGradeError(null);
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

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
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
              {CATEGORY_LABELS[task.category]}
            </span>
            <span className="rounded-md border border-surface-border bg-surface-hover px-2 py-1 text-xs font-bold text-foreground">
              {DIFFICULTY_LABELS[task.difficulty]}
            </span>
          </div>

          <div className="mt-4 rounded-3xl border border-accent/20 bg-surface/90 p-6 sm:p-8">
            <h2 className="text-xl font-black text-foreground">{task.title}</h2>
            <div className="mt-3">
              <TheoryMarkdown content={formatCkeMathText(task.prompt)} />
            </div>
            {task.hint && !answered && (
              <p className="mt-3 text-sm text-muted">💡 {task.hint}</p>
            )}

            {open ? (
              <ProGate featureLabel="Ocena zadań otwartych przez AI">
                <div className="mt-6 space-y-3">
                  <label
                    htmlFor="review-open-answer"
                    className="text-sm font-bold text-foreground"
                  >
                    Twoja odpowiedź ({formatPkt(maxPoints)})
                  </label>
                  <textarea
                    id="review-open-answer"
                    value={typedAnswer}
                    disabled={answered || grading}
                    onChange={(event) => setTypedAnswer(event.target.value)}
                    rows={4}
                    placeholder="Wpisz wynik lub całe rozwiązanie…"
                    className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"
                  />
                  {!answered && (
                    <button
                      type="button"
                      disabled={!typedAnswer.trim() || grading}
                      onClick={() => void handleOpenCheck()}
                      className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-on-accent disabled:opacity-50"
                    >
                      {grading ? "Oceniam…" : "Sprawdź odpowiedź"}
                    </button>
                  )}
                  {gradeError && (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-amber-200"
                    >
                      {gradeError}
                    </p>
                  )}
                </div>
              </ProGate>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {task.choices.map((choice, choiceIndex) => {
                  let style =
                    "border-surface-border bg-background hover:border-accent/40 hover:bg-accent/10";
                  if (answered) {
                    if (choiceIndex === task.correctIndex) {
                      style = "border-success/60 bg-success/20 text-success";
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
                      className={`relative rounded-2xl border px-4 py-4 text-left text-base font-bold text-foreground transition-colors ${style}`}
                      whileTap={answered ? undefined : { scale: 0.98 }}
                    >
                      <MathText content={formatCkeMathText(choice)} />
                      {answered && choiceIndex === task.correctIndex && (
                        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-success" />
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
            )}

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-2xl border p-4 ${
                  isCorrect
                    ? "border-success/40 bg-success/10"
                    : openGrade?.verdict === "partial"
                      ? "border-amber-500/40 bg-amber-500/10"
                      : "border-red-500/40 bg-red-500/10"
                }`}
              >
                <p className="font-black text-foreground">
                  {isCorrect
                    ? "Dobrze! 🎉"
                    : openGrade?.verdict === "partial"
                      ? "Częściowo - wróci do powtórki"
                      : "Wróci do powtórki wkrótce"}
                </p>
                {open && openAwarded != null && (
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {formatPkt(openAwarded)} / {formatPkt(maxPoints)}
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
                  <div className="mt-2 text-sm text-foreground">
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
