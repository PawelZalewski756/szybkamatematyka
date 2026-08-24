import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { consumeMemoryRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest, readRequestId, requestIdHeaders } from "@/lib/observability/request-id";
import { isProductEventName } from "@/lib/metrics/product-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = readRequestId(request);
  const headers = requestIdHeaders(requestId);
  const ip = clientIpFromRequest(request);
  const limit = consumeMemoryRateLimit(`metrics:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    return Response.json(
      { ok: false },
      { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let event = "";
  try {
    const body = (await request.json()) as { event?: unknown };
    event = typeof body.event === "string" ? body.event.trim() : "";
  } catch {
    return Response.json({ ok: false }, { status: 400, headers });
  }

  if (!isProductEventName(event)) {
    return Response.json({ ok: false }, { status: 400, headers });
  }

  const sb = getServiceSupabaseOrNull();
  if (sb) {
    await sb.rpc("increment_product_metric", { p_event: event });
  }

  return Response.json({ ok: true }, { headers });
}
