"use client";

import { MathText } from "@/components/trening/MathText";
import { fetchTaskGrade, fetchTaskHint } from "@/lib/trening/task-assist-client";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { Loader2, Lock, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MAX_HINTS = 3;

type TaskAiPanelProps = {
  taskId: string;
  taskContent: string;
  correctAnswer: string;
  examLabel: string;
  topicLabel: string;
  isOpenTask: boolean;
  options?: string[];
  feedback: "correct" | "wrong" | null;
  showGradeOption?: boolean;
  studentAnswer?: string;
  onAiAccepted?: (answer: string) => void;
  disabled?: boolean;
};

export function TaskAiPanel({
  taskId,
  taskContent,
  correctAnswer,
  examLabel,
  topicLabel,
  isOpenTask,
  options,
  feedback,
  showGradeOption = false,
  studentAnswer,
  onAiAccepted,
  disabled = false,
}: TaskAiPanelProps) {
  const { loading, isLoggedIn, isPro } = useSubscription();
  const [hintLevel, setHintLevel] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [gradeText, setGradeText] = useState<string | null>(null);
  const [busy, setBusy] = useState<"hint" | "grade" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHintLevel(0);
    setHintText(null);
    setGradeText(null);
    setError(null);
    setBusy(null);
  }, [taskId]);

  const canUse = isPro && !disabled && feedback !== "correct";

  async function handleHint() {
    if (!canUse || busy) return;
    if (hintLevel >= MAX_HINTS) {
      setError("Wykorzystałeś wszystkie podpowiedzi do tego zadania.");
      return;
    }

    setBusy("hint");
    setError(null);
    try {
      const { hint } = await fetchTaskHint({
        taskContent,
        correctAnswer,
        hintLevel,
        examLabel,
        topicLabel,
        isOpenTask,
        options,
      });
      setHintText(hint);
      setHintLevel((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podpowiedzi AI.");
    } finally {
      setBusy(null);
    }
  }

  async function handleGrade() {
    if (!canUse || busy || !studentAnswer?.trim()) return;

    setBusy("grade");
    setError(null);
    setGradeText(null);
    try {
      const { grade } = await fetchTaskGrade({
        taskContent,
        correctAnswer,
        studentAnswer: studentAnswer.trim(),
        examLabel,
        topicLabel,
      });
      setGradeText(grade.feedback);
      if (grade.acceptAsCorrect && onAiAccepted) {
        onAiAccepted(studentAnswer.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd oceny AI.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return null;

  if (!isLoggedIn || !isPro) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={isLoggedIn ? "/cennik" : "/login"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/15"
        >
          <Lock className="h-3.5 w-3.5" />
          Asystent AI — plan Pro
        </Link>
      </div>
    );
  }

  const showGrade =
    isOpenTask && showGradeOption && Boolean(studentAnswer?.trim());

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canUse || busy !== null || hintLevel >= MAX_HINTS}
          onClick={() => void handleHint()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:opacity-50"
        >
          {busy === "hint" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Podpowiedź AI
          {hintLevel > 0 ? ` (${hintLevel}/${MAX_HINTS})` : ""}
        </button>

        {showGrade && (
          <button
            type="button"
            disabled={!canUse || busy !== null}
            onClick={() => void handleGrade()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/15 disabled:opacity-50"
          >
            {busy === "grade" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            Sprawdź z AI
          </button>
        )}
      </div>

      {hintText && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-300">
            Podpowiedź
          </p>
          <MathText content={hintText} as="div" />
        </div>
      )}

      {gradeText && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-cyan-300">
            Analiza AI
          </p>
          <MathText content={gradeText} as="div" />
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}
