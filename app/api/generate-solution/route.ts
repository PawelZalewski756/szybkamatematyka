import {
  formatGeminiErrorForUser,
  generateMathSolution,
} from "@/lib/gemini/generate-solution";
import { reportError } from "@/lib/observability/report-error";
import { readRequestId, requestIdHeaders } from "@/lib/observability/request-id";
import { consumeRateLimit } from "@/lib/rate-limit";
import { verifyAdminRequest } from "@/lib/supabase/admin";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

export async function POST(request: Request) {
  const requestId = readRequestId(request);
  const headers = requestIdHeaders(requestId);

  try {
    // 1) Autoryzacja: endpoint pali quota Gemini — tylko admin (panel / seed).
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return Response.json(
        { error: auth.error },
        { status: auth.status, headers },
      );
    }

    // 2) Rate limit per admin — baza, gdy jest service role.
    const limit = await consumeRateLimit(
      `admin-gemini:${auth.user.id}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!limit.allowed) {
      return Response.json(
        {
          error: `Za dużo żądań. Spróbuj ponownie za ${limit.retryAfterSec} s.`,
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": String(limit.retryAfterSec),
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Nieprawidłowy format JSON w żądaniu." },
        { status: 400, headers },
      );
    }

    const readString = (key: string): string | undefined => {
      if (typeof body !== "object" || body === null || !(key in body)) {
        return undefined;
      }
      const value = (body as Record<string, unknown>)[key];
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    };

    const trescZadania = readString("trescZadania") ?? "";

    if (!trescZadania) {
      return Response.json(
        { error: "Pole trescZadania jest wymagane i nie może być puste." },
        { status: 400, headers },
      );
    }

    const solution = await generateMathSolution({
      trescZadania,
      kontekstEgzaminu: readString("kontekstEgzaminu"),
      tytul: readString("tytul"),
    });

    return Response.json({ solution }, { headers });
  } catch (err) {
    await reportError(err, { source: "generate-solution", requestId });
    const message =
      err instanceof Error ? err.message : "Nieznany błąd generowania.";
    const { status, error } = formatGeminiErrorForUser(message);
    const responseHeaders: Record<string, string> = { ...headers };
    if (status === 429) {
      const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
      if (retryMatch) {
        responseHeaders["Retry-After"] = String(
          Math.ceil(parseFloat(retryMatch[1])),
        );
      }
    }
    return Response.json({ error }, { status, headers: responseHeaders });
  }
}
