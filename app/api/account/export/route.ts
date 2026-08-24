import { exportAccountData } from "@/lib/account/server";
import { reportError } from "@/lib/observability/report-error";
import { consumeRateLimit } from "@/lib/rate-limit";
import { readRequestId, requestIdHeaders } from "@/lib/observability/request-id";
import { getBearerToken } from "@/lib/supabase/admin";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = readRequestId(request);
  const headers = requestIdHeaders(requestId);

  const auth = await verifyUserRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status, headers });
  }

  const limit = await consumeRateLimit(`account-export:${auth.user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json(
      { error: `Za dużo eksportów. Spróbuj za ${limit.retryAfterSec} s.` },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  const token = getBearerToken(request);
  if (!token) {
    return Response.json({ error: "Wymagane zalogowanie." }, { status: 401, headers });
  }

  try {
    const payload = await exportAccountData(auth.user, token);
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="szybkamatematyka-konto.json"`,
      },
    });
  } catch (error) {
    await reportError(error, { source: "account.export", requestId });
    return Response.json(
      { error: "Nie udało się przygotować eksportu." },
      { status: 500, headers },
    );
  }
}
