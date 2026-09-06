"use client";

import { MathText } from "@/components/trening/MathText";
import {
  fetchTaskAsk,
  fetchTaskAssistQuota,
  fetchTaskGrade,
  fetchTaskHint,
  type AssistQuotaSnapshot,
} from "@/lib/trening/task-assist-client";
import type { TaskAssistAskTurn } from "@/lib/gemini/prompts-task-assist";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { Loader2, Lock, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

const MAX_HINTS = 3;
const MAX_ASK = 6;

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
  autoGrade?: boolean;
  studentAnswer?: string;
  onAiAccepted?: (answer: string) => void;
  disabled?: boolean;
};

function quotaRemaining(quota: AssistQuotaSnapshot | null, isPro: boolean): number {
  if (isPro) return Number.POSITIVE_INFINITY;
  return quota?.remaining ?? 0;
}

function freeQuotaLabel(quota: AssistQuotaSnapshot | null): string | null {
  if (!quota || quota.isPro || quota.limit == null) return null;
  const remaining = quota.remaining ?? 0;
  return `Pozostało ${remaining} z ${quota.limit} zapytań (${quota.periodLabel})`;
}

export function TaskAiPanel(props: TaskAiPanelProps) {
  return <TaskAiPanelInner key={props.taskId} {...props} />;
}

function TaskAiPanelInner({
  taskId,
  taskContent,
  correctAnswer,
  examLabel,
  topicLabel,
  isOpenTask,
  options,
  feedback,
  showGradeOption = false,
  autoGrade = false,
  studentAnswer,
  onAiAccepted,
  disabled = false,
}: TaskAiPanelProps) {
  const { loading, isLoggedIn, isPro } = useSubscription();
  const [quota, setQuota] = useState<AssistQuotaSnapshot | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [gradeText, setGradeText] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<TaskAssistAskTurn[]>([]);
  const [askDraft, setAskDraft] = useState("");
  const [busy, setBusy] = useState<"hint" | "grade" | "ask" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshQuota = useCallback(async () => {
    if (!isLoggedIn) {
      setQuota(null);
      return;
    }
    setQuotaLoading(true);
    try {
      const next = await fetchTaskAssistQuota();
      setQuota(next);
    } catch {
      /* ignore — panel nadal działa dla Pro */
    } finally {
      setQuotaLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (loading || !isLoggedIn) return;
    const id = window.setTimeout(() => {
      void refreshQuota();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loading, isLoggedIn, isPro, refreshQuota]);

  const remaining = quotaRemaining(quota, isPro);
  const hasQuota = isPro || remaining > 0;
  const canUse =
    isLoggedIn && hasQuota && !disabled && feedback !== "correct";
  const askCount = chatTurns.filter((t) => t.role === "user").length;
  const quotaLabel = freeQuotaLabel(quota);

  function applyQuotaFromResponse(next?: AssistQuotaSnapshot) {
    if (next) setQuota(next);
  }

  function applyQuotaFromError(err: unknown) {
    const quotaFromErr = (err as { quota?: AssistQuotaSnapshot })?.quota;
    if (quotaFromErr) setQuota(quotaFromErr);
  }

  async function handleHint() {
    if (!canUse || busy) return;
    if (hintLevel >= MAX_HINTS) {
      setError("Wykorzystałeś wszystkie podpowiedzi do tego zadania.");
      return;
    }

    setBusy("hint");
    setError(null);
    try {
      const result = await fetchTaskHint({
        taskId,
        taskContent,
        correctAnswer,
        hintLevel,
        examLabel,
        topicLabel,
        isOpenTask,
        options,
      });
      setHintText(result.hint);
      setHintLevel((n) => n + 1);
      applyQuotaFromResponse(result.quota);
    } catch (err) {
      applyQuotaFromError(err);
      setError(err instanceof Error ? err.message : "Błąd podpowiedzi.");
    } finally {
      setBusy(null);
    }
  }

  const handleGrade = useCallback(async () => {
    if (!canUse || busy || !studentAnswer?.trim()) return;

    setBusy("grade");
    setError(null);
    setGradeText(null);
    try {
      const result = await fetchTaskGrade({
        taskId,
        taskContent,
        correctAnswer,
        studentAnswer: studentAnswer.trim(),
        examLabel,
        topicLabel,
      });
      setGradeText(result.grade.feedback);
      applyQuotaFromResponse(result.quota);
      if (result.grade.acceptAsCorrect && onAiAccepted) {
        onAiAccepted(studentAnswer.trim());
      }
    } catch (err) {
      applyQuotaFromError(err);
      setError(err instanceof Error ? err.message : "Błąd oceny odpowiedzi.");
    } finally {
      setBusy(null);
    }
  }, [
    busy,
    canUse,
    correctAnswer,
    examLabel,
    onAiAccepted,
    studentAnswer,
    taskContent,
    topicLabel,
  ]);

  const gradedAnswerRef = useRef<string | null>(null);
  useEffect(() => {
    if (!autoGrade || loading) return;
    const answer = studentAnswer?.trim();
    if (!answer || !showGradeOption || !canUse || busy) return;
    if (gradedAnswerRef.current === answer) return;
    gradedAnswerRef.current = answer;
    void handleGrade();
  }, [
    autoGrade,
    busy,
    canUse,
    handleGrade,
    loading,
    showGradeOption,
    studentAnswer,
  ]);

  async function handleAsk(event?: FormEvent) {
    event?.preventDefault();
    const message = askDraft.trim();
    if (!canUse || busy || !message) return;
    if (askCount >= MAX_ASK) {
      setError(`Możesz zadać maksymalnie ${MAX_ASK} pytań do tego zadania.`);
      return;
    }

    const history = [...chatTurns];
    setChatTurns((prev) => [...prev, { role: "user", content: message }]);
    setAskDraft("");
    setBusy("ask");
    setError(null);

    try {
      const result = await fetchTaskAsk({
        taskId,
        taskContent,
        correctAnswer,
        userMessage: message,
        examLabel,
        topicLabel,
        hintContext: hintText ?? undefined,
        gradeContext: gradeText ?? undefined,
        conversationHistory: history,
      });
      setChatTurns((prev) => [...prev, { role: "assistant", content: result.reply }]);
      applyQuotaFromResponse(result.quota);
    } catch (err) {
      setChatTurns(history);
      setAskDraft(message);
      applyQuotaFromError(err);
      setError(err instanceof Error ? err.message : "Nie udało się wysłać pytania.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return null;

  if (!isLoggedIn) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/15"
        >
          <Lock className="h-3.5 w-3.5" />
          Zaloguj się, aby skorzystać z podpowiedzi
        </Link>
      </div>
    );
  }

  if (!isPro && !quotaLoading && quota && (quota.remaining ?? 0) <= 0) {
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3">
        <p className="text-xs font-semibold text-foreground/90">
          Wykorzystałeś {quota.limit} darmowych zapytań w {quota.periodLabel}.
        </p>
        <Link
          href="/cennik"
          className="inline-flex text-xs font-bold text-brand transition hover:underline"
        >
          Przejdź na Pro — nielimitowane podpowiedzi
        </Link>
      </div>
    );
  }

  const showGrade =
    isOpenTask && showGradeOption && Boolean(studentAnswer?.trim());

  return (
    <div className="mt-4 space-y-3">
      {!isPro && quotaLabel && (
        <p className="text-[11px] font-semibold text-muted">{quotaLabel}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canUse || busy !== null || hintLevel >= MAX_HINTS}
          onClick={() => void handleHint()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:opacity-50"
        >
          {busy === "hint" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Podpowiedź
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
            ) : null}
            Sprawdź odpowiedź
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
            Komentarz
          </p>
          <MathText content={gradeText} as="div" />
        </div>
      )}

      {chatTurns.length > 0 && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-white/[0.03] px-4 py-3">
          {chatTurns.map((turn, index) => (
            <div
              key={`${turn.role}-${index}`}
              className={
                turn.role === "user"
                  ? "text-sm text-foreground/90"
                  : "border-t border-surface-border/60 pt-2 text-sm leading-relaxed text-foreground/90 first:border-t-0 first:pt-0"
              }
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                {turn.role === "user" ? "Ty" : "Odpowiedź"}
              </p>
              {turn.role === "user" ? (
                <p>{turn.content}</p>
              ) : (
                <MathText content={turn.content} as="div" />
              )}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => void handleAsk(event)}
        className="space-y-2 rounded-xl border border-surface-border bg-white/[0.02] p-3"
      >
        <label htmlFor={`task-ask-${taskId}`} className="sr-only">
          Napisz, czego nie rozumiesz
        </label>
        <textarea
          id={`task-ask-${taskId}`}
          rows={2}
          value={askDraft}
          onChange={(event) => setAskDraft(event.target.value)}
          disabled={!canUse || busy !== null || askCount >= MAX_ASK}
          placeholder="Nie rozumiem… napisz własnymi słowami, czego nie ogarniasz"
          className="w-full resize-none rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-violet-500/40 focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted">
            {askCount > 0
              ? `Pytania do tego zadania: ${askCount}/${MAX_ASK}`
              : quotaLabel ?? "Możesz doprecyzować własnymi słowami"}
          </p>
          <button
            type="submit"
            disabled={
              !canUse || busy !== null || !askDraft.trim() || askCount >= MAX_ASK
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15 disabled:opacity-50"
          >
            {busy === "ask" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Wyślij
          </button>
        </div>
      </form>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}
