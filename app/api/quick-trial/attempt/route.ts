import { createHmac } from "node:crypto";
import { isIP } from "node:net";
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

function getClientIp(request: Request): string | null {
  const headerName =
    process.env.VERCEL === "1"
      ? "x-vercel-forwarded-for"
      : "x-forwarded-for";
  const rawIp = request.headers.get(headerName)?.split(",")[0]?.trim();
  if (rawIp && isIP(rawIp)) return rawIp;
  return process.env.NODE_ENV === "production" ? null : "127.0.0.1";
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

  const clientIp = getClientIp(request);
  if (!clientIp) {
    return Response.json(
      { error: "Request rate limiting is not configured." },
      { status: 503 },
    );
  }
  const ipHash = createHmac("sha256", serviceKey).update(clientIp).digest("hex");

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("record_quick_trial_attempt", {
    p_session_id: body.sessionId,
    p_is_correct: body.isCorrect,
    p_ip_hash: ipHash,
  });
  if (error) {
    console.error("Could not record quick trial attempt:", error);
    return Response.json(
      { error: "Could not record quick trial attempt." },
      { status: 500 },
    );
  }

  if (data !== true) {
    return Response.json(
      { error: "Too many quick trial attempts. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return Response.json({ ok: true });
}
