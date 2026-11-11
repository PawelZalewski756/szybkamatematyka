import {
  formatGeminiErrorForUser,
} from "@/lib/gemini/generate-solution";
import {
  generateTaskAskReply,
  generateTaskHint,
  gradeOpenTaskAnswer,
} from "@/lib/gemini/generate-task-assist";
import {
  consumeAssistQuota,
  readAssistQuota,
  type AssistQuotaSnapshot,
} from "@/lib/subscription/task-assist-quota";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";
import { findCachedTaskById } from "@/lib/trening/seed/tasks-cache-utils";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import {
  examTaskPoints,
  expectedOpenAnswer,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function readString(
  body: unknown,
  key: string,
  maxLength = 8_000,
): string | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = (body as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return undefined;
  return trimmed || undefined;
}

function readNumber(body: unknown, key: string): number | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = Number((body as Record<string, unknown>)[key]);
  return Number.isFinite(value) ? value : undefined;
}

function readBool(body: unknown, key: string): boolean | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : undefined;
}

function readStringArray(body: unknown, key: string): string[] | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = (body as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return undefined;
  return value
    .slice(0, 8)
    .map((v) => String(v ?? "").trim().slice(0, 500))
    .filter(Boolean);
}

type AskTurn = { role: "user" | "assistant"; content: string };

function readConversation(body: unknown, key: string): AskTurn[] | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = (body as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return undefined;

  const turns: AskTurn[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    turns.push({ role, content: trimmed.slice(0, 1_000) });
  }
  return turns.length > 0 ? turns.slice(-12) : undefined;
}

function jsonWithQuota(payload: Record<string, unknown>, quota: AssistQuotaSnapshot) {
  return Response.json({ ...payload, quota });
}

/**
 * POST /api/trening/task-assist
 * Body: { mode: "hint" | "grade" | "ask", taskId, taskContent, correctAnswer, ... }
 * Auth: Bearer (Pro = bez limitu miesięcznego; free = max 10 zapytań / miesiąc).
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyTaskAssistRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    const { user, isPro } = auth;

    if (isPro) {
      const limit = checkRateLimit(`pro-ai:${user.id}`);
      if (!limit.allowed) {
        return Response.json(
          {
            error: `Limit zapytań (${RATE_LIMIT_MAX}/h). Spróbuj za ${limit.retryAfterSec} s.`,
          },
          {
            status: 429,
            headers: { "Retry-After": String(limit.retryAfterSec) },
          },
        );
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Nieprawidłowy format JSON w żądaniu." },
        { status: 400 },
      );
    }

    const mode = readString(body, "mode", 20);
    const taskId = readString(body, "taskId", 160);
    const submittedTaskContent = readString(body, "taskContent", 8_000);
    const submittedCorrectAnswer = readString(body, "correctAnswer", 500);

    if (mode !== "hint" && mode !== "grade" && mode !== "ask") {
      return Response.json(
        { error: 'Pole mode musi być "hint", "grade" lub "ask".' },
        { status: 400 },
      );
    }

    if (!submittedTaskContent || !submittedCorrectAnswer) {
      return Response.json(
        { error: "Pola taskContent i correctAnswer są wymagane." },
        { status: 400 },
      );
    }

    const canonicalTask = taskId ? findCachedTaskById(taskId) : null;
    const catalogTask =
      !canonicalTask && taskId ? getTaskById(taskId) ?? null : null;
    const rawTaskContent =
      canonicalTask?.content.replace(/[\u200B-\u200D\uFEFF]/g, "").trim() ??
      catalogTask?.prompt.trim() ??
      submittedTaskContent;
    const taskContent = formatCkeMathText(rawTaskContent);
    const correctAnswer =
      canonicalTask?.correct_answer.trim() ??
      (catalogTask
        ? isOpenExamTask(catalogTask)
          ? expectedOpenAnswer(catalogTask).trim()
          : catalogTask.choices[catalogTask.correctIndex]?.trim()
        : undefined) ??
      submittedCorrectAnswer;
    const canonicalOptions =
      canonicalTask?.options ??
      (catalogTask ? [...catalogTask.choices] : undefined);

    if (mode === "grade" && !isPro && taskId?.startsWith("sprawdzian:")) {
      return Response.json(
        { error: "Ocena zadań otwartych przez AI jest dostępna w planie Pro." },
        { status: 403 },
      );
    }
    const maxPoints = catalogTask
      ? examTaskPoints(catalogTask)
      : Math.max(
          1,
          Math.min(10, Math.round(readNumber(body, "maxPoints") ?? 1)),
        );

    const studentAnswer = mode === "grade"
      ? readString(body, "studentAnswer")
      : undefined;
    const userMessage = mode === "ask"
      ? readString(body, "userMessage")
      : undefined;

    if (mode === "grade" && !studentAnswer) {
      return Response.json(
        { error: "Pole studentAnswer jest wymagane dla trybu grade." },
        { status: 400 },
      );
    }
    if (mode === "ask" && !userMessage) {
      return Response.json(
        { error: "Pole userMessage jest wymagane dla trybu ask." },
        { status: 400 },
      );
    }

    const examLabel = readString(body, "examLabel");
    const topicLabel = readString(body, "topicLabel");
    let reservedQuota: AssistQuotaSnapshot | null = null;

    if (!isPro) {
      const reservation = await consumeAssistQuota(user.id, false);
      if (!reservation.ok) {
        const status = reservation.error.startsWith("Wykorzystałeś")
          ? 429
          : 503;
        return Response.json(
          { error: reservation.error, quota: reservation.quota },
          { status },
        );
      }
      reservedQuota = reservation.quota;
    }

    async function finish<T extends Record<string, unknown>>(
      payload: T,
    ): Promise<Response> {
      if (isPro) {
        return jsonWithQuota(payload, await readAssistQuota(user.id, true));
      }

      if (!reservedQuota) {
        throw new Error("Brak rezerwacji limitu asysty.");
      }
      return jsonWithQuota(payload, reservedQuota);
    }

    if (mode === "hint") {
      const hintLevel = Math.max(0, Math.min(2, readNumber(body, "hintLevel") ?? 0));
      const hint = await generateTaskHint({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        hintLevel,
        isOpenTask:
          canonicalOptions !== undefined
            ? canonicalOptions.length === 0
            : (readBool(body, "isOpenTask") ?? false),
        options: canonicalOptions ?? readStringArray(body, "options"),
      });
      return finish({ hint, hintLevel });
    }

    if (mode === "grade") {
      const grade = await gradeOpenTaskAnswer({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        studentAnswer: studentAnswer!,
        maxPoints,
        markingNotes: readString(body, "markingNotes"),
      });
      return finish({ grade });
    }

    if (mode === "ask") {
      const reply = await generateTaskAskReply({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        userMessage: userMessage!,
        hintContext: readString(body, "hintContext"),
        gradeContext: readString(body, "gradeContext"),
        conversationHistory: readConversation(body, "conversationHistory"),
      });
      return finish({ reply });
    }

    throw new Error("Nieobsługiwany tryb asysty.");
  } catch (err) {
    console.error("[task-assist]", err);
    const message =
      err instanceof Error ? err.message : "Nieznany błąd asystenta.";
    const { status, error } = formatGeminiErrorForUser(message);
    return Response.json({ error }, { status });
  }
}
