import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isAttemptBody(
  value: unknown,
): value is { sessionId: string; isCorrect: boolean } {
  return (
    typeof value === "object" &&
    value !== null &&
    "sessionId" in value &&
    typeof value.sessionId === "string" &&
    SESSION_ID_PATTERN.test(value.sessionId) &&
    "isCorrect" in value &&
    typeof value.isCorrect === "boolean"
  );
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!isAttemptBody(body)) {
    return Response.json({ error: "Invalid attempt." }, { status: 400 });
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return Response.json(
      { error: "Quick trial statistics are not configured." },
      { status: 503 },
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc("record_quick_trial_attempt", {
    p_session_id: body.sessionId,
    p_is_correct: body.isCorrect,
  });
  if (error) {
    console.error("Could not record quick trial attempt:", error);
    return Response.json(
      { error: "Could not record quick trial attempt." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
