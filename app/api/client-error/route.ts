import { consumeMemoryRateLimit } from "@/lib/rate-limit";
import { reportError } from "@/lib/observability/report-error";
import { clientIpFromRequest, readRequestId, requestIdHeaders } from "@/lib/observability/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

/**
 * POST /api/client-error
 * Przyjmuje skrócony opis błędu z przeglądarki. Bez stacków i bez PII.
 */
export async function POST(request: Request) {
  const requestId = readRequestId(request);
  const headers = requestIdHeaders(requestId);
  const ip = clientIpFromRequest(request);
  const limit = consumeMemoryRateLimit(`client-error:${ip}`, MAX_PER_WINDOW, WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      { ok: false },
      { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400, headers });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message =
    typeof record.message === "string" ? record.message.trim().slice(0, 300) : "";
  if (!message) {
    return Response.json({ ok: false }, { status: 400, headers });
  }
  const digest =
    typeof record.digest === "string" ? record.digest.trim().slice(0, 80) : undefined;
  const source =
    typeof record.source === "string" ? record.source.trim().slice(0, 40) : "client";

  const error = Object.assign(new Error(message), digest ? { digest } : {});
  await reportError(error, { source: `client.${source}`, requestId });

  return Response.json({ ok: true }, { headers });
}
