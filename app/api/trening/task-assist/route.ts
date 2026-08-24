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
import { reportError } from "@/lib/observability/report-error";
import { readRequestId, requestIdHeaders } from "@/lib/observability/request-id";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

function readString(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null || !(key in body)) return undefined;
  const value = (body as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
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
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
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
    turns.push({ role, content: trimmed });
  }
  return turns.length > 0 ? turns : undefined;
}

function jsonWithQuota(payload: Record<string, unknown>, quota: AssistQuotaSnapshot) {
  return Response.json({ ...payload, quota });
}

/**
 * POST /api/trening/task-assist
 * Body: { mode: "hint" | "grade" | "ask", taskContent, correctAnswer, ... }
 * Auth: Bearer (Pro = bez limitu miesięcznego; free = max 10 zapytań / miesiąc).
 */
export async function POST(request: Request) {
  const requestId = readRequestId(request);
  const reqHeaders = requestIdHeaders(requestId);

  try {
    const auth = await verifyTaskAssistRequest(request);
    if (!auth.ok) {
      return Response.json(
        { error: auth.error },
        { status: auth.status, headers: reqHeaders },
      );
    }
    const { user, isPro } = auth;

    if (isPro) {
      const limit = await consumeRateLimit(
        `pro-ai:${user.id}`,
        RATE_LIMIT_MAX,
        RATE_LIMIT_WINDOW_MS,
      );
      if (!limit.allowed) {
        return Response.json(
          {
            error: `Limit zapytań (${RATE_LIMIT_MAX}/h). Spróbuj za ${limit.retryAfterSec} s.`,
          },
          {
            status: 429,
            headers: {
              ...reqHeaders,
              "Retry-After": String(limit.retryAfterSec),
            },
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

    const mode = readString(body, "mode");
    const taskContent = readString(body, "taskContent");
    const correctAnswer = readString(body, "correctAnswer");

    if (!taskContent || !correctAnswer) {
      return Response.json(
        { error: "Pola taskContent i correctAnswer są wymagane." },
        { status: 400 },
      );
    }

    if (!isPro) {
      const current = await readAssistQuota(user.id, false);
      if ((current.remaining ?? 0) <= 0) {
        return Response.json(
          {
            error: `Wykorzystałeś ${current.limit} darmowych zapytań w ${current.periodLabel}. Plan Pro daje nielimitowany dostęp.`,
            quota: current,
          },
          { status: 429 },
        );
      }
    }

    const examLabel = readString(body, "examLabel");
    const topicLabel = readString(body, "topicLabel");

    async function finish<T extends Record<string, unknown>>(payload: T) {
      const quota = isPro
        ? await readAssistQuota(user.id, true)
        : (await consumeAssistQuota(user.id, false)).quota;
      return jsonWithQuota(payload, quota);
    }

    if (mode === "hint") {
      const hintLevel = Math.max(0, Math.min(2, readNumber(body, "hintLevel") ?? 0));
      const hint = await generateTaskHint({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        hintLevel,
        isOpenTask: readBool(body, "isOpenTask") ?? false,
        options: readStringArray(body, "options"),
      });
      return finish({ hint, hintLevel });
    }

    if (mode === "grade") {
      const studentAnswer = readString(body, "studentAnswer");
      if (!studentAnswer) {
        return Response.json(
          { error: "Pole studentAnswer jest wymagane dla trybu grade." },
          { status: 400 },
        );
      }

      const grade = await gradeOpenTaskAnswer({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        studentAnswer,
      });
      return finish({ grade });
    }

    if (mode === "ask") {
      const userMessage = readString(body, "userMessage");
      if (!userMessage) {
        return Response.json(
          { error: "Pole userMessage jest wymagane dla trybu ask." },
          { status: 400 },
        );
      }

      const reply = await generateTaskAskReply({
        examLabel,
        topicLabel,
        taskContent,
        correctAnswer,
        userMessage,
        hintContext: readString(body, "hintContext"),
        gradeContext: readString(body, "gradeContext"),
        conversationHistory: readConversation(body, "conversationHistory"),
      });
      return finish({ reply });
    }

    return Response.json(
      { error: 'Pole mode musi być "hint", "grade" lub "ask".' },
      { status: 400 },
    );
  } catch (err) {
    await reportError(err, { source: "task-assist", requestId });
    const message =
      err instanceof Error ? err.message : "Nieznany błąd asystenta.";
    const { status, error } = formatGeminiErrorForUser(message);
    return Response.json({ error }, { status, headers: reqHeaders });
  }
}
