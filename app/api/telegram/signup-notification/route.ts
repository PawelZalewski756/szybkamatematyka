import { timingSafeEqual } from "node:crypto";
import { deliverSignupNotification } from "@/lib/telegram/signup-delivery";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
 * Backfill / ponowienie powiadomienia o koncie. Główna ścieżka to
 * `/api/signup`, który ma już dane użytkownika i nie potrzebuje tego endpointu.
 *
 * Autoryzacja:
 * - jeśli ustawiono `TELEGRAM_SIGNUP_SECRET`, wymagany nagłówek
 *   `x-telegram-signup-secret` (dla przyszłego triggera DB/webhooka),
 * - w przeciwnym razie wymagany zalogowany administrator (Bearer token).
 */
export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_SIGNUP_SECRET?.trim();
  if (sharedSecret) {
    if (!matchesSecret(request.headers.get("x-telegram-signup-secret"), sharedSecret)) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  } else {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userId =
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    typeof payload.userId === "string"
      ? payload.userId
      : "";
  if (!UUID_PATTERN.test(userId)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  const result = await deliverSignupNotification(userId);
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
