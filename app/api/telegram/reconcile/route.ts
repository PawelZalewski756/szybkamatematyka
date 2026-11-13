import { timingSafeEqual } from "node:crypto";
import { reconcileSignupNotifications } from "@/lib/telegram/signup-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

/**
 * Ręczne odratowanie powiadomień o rejestracjach.
 *
 *   curl -X POST -H "Authorization: Bearer $TELEGRAM_SETUP_SECRET" \
 *     "https://szybkamatematyka.pl/api/telegram/reconcile?hours=24"
 */
export async function POST(request: Request): Promise<Response> {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET?.trim();
  if (!setupSecret) {
    return Response.json(
      { error: "TELEGRAM_SETUP_SECRET is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (
    !matchesSecret(
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null,
      setupSecret,
    )
  ) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(request.url);
  const requestedHours = Number(url.searchParams.get("hours") ?? "24");
  const hours =
    Number.isFinite(requestedHours) && requestedHours >= 1 && requestedHours <= 168
      ? Math.floor(requestedHours)
      : 24;

  try {
    const result = await reconcileSignupNotifications(hours);
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[telegram-reconcile] failed:", error);
    return Response.json(
      {
        error: "Reconcile failed.",
        detail: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
