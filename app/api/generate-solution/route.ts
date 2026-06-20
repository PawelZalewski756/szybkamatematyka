import {
  formatGeminiErrorForUser,
  generateMathSolution,
} from "@/lib/gemini/generate-solution";
import { verifyAdminRequest } from "@/lib/supabase/admin";

// --- Rate limit (in-memory, fixed window) -----------------------------------
// UWAGA: stan trzymany jest w pamięci procesu, więc działa PER INSTANCJA.
// W środowisku serverless (wiele instancji / cold starty) limit nie jest
// globalny. Docelowo przenieść do współdzielonego store'u (Redis / Upstash),
// żeby limit obowiązywał spójnie dla wszystkich instancji.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuta
const RATE_LIMIT_MAX = 12; // maks. wywołań w oknie / użytkownika (lub IP)

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

export async function POST(request: Request) {
  try {
    // 1) Autoryzacja: endpoint pali quota Gemini — tylko admin (panel / seed).
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // 2) Rate limit per admin.
    const rateKey = `admin:${auth.user.id}`;
    const limit = checkRateLimit(rateKey);
    if (!limit.allowed) {
      return Response.json(
        {
          error: `Za dużo żądań. Spróbuj ponownie za ${limit.retryAfterSec} s.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        },
      );
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
        { status: 400 },
      );
    }

    const solution = await generateMathSolution({
      trescZadania,
      kontekstEgzaminu: readString("kontekstEgzaminu"),
      tytul: readString("tytul"),
    });

    return Response.json({ solution });
  } catch (err) {
    console.error("[generate-solution]", err);
    const message =
      err instanceof Error ? err.message : "Nieznany błąd generowania.";
    const { status, error } = formatGeminiErrorForUser(message);
    const headers: Record<string, string> = {};
    if (status === 429) {
      const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
      if (retryMatch) {
        headers["Retry-After"] = String(Math.ceil(parseFloat(retryMatch[1])));
      }
    }
    return Response.json({ error }, { status, headers });
  }
}
