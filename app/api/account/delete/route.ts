import { deleteAccountData } from "@/lib/account/server";
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

  const limit = await consumeRateLimit(`account-delete:${auth.user.id}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json(
      { error: `Za dużo prób. Spróbuj za ${limit.retryAfterSec} s.` },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  let confirm = "";
  try {
    const body = (await request.json()) as { confirm?: unknown };
    confirm = typeof body.confirm === "string" ? body.confirm.trim() : "";
  } catch {
    confirm = "";
  }
  if (confirm !== "USUN") {
    return Response.json(
      { error: "Aby usunąć konto, wpisz USUN." },
      { status: 400, headers },
    );
  }

  const token = getBearerToken(request);
  if (!token) {
    return Response.json({ error: "Wymagane zalogowanie." }, { status: 401, headers });
  }

  try {
    const result = await deleteAccountData(auth.user, token);
    return Response.json(
      {
        ok: true,
        authDeleted: result.authDeleted,
        message: result.authDeleted
          ? "Konto i dane zostały usunięte."
          : "Dane z serwisu zostały wyczyszczone. Logowanie usuń dodatkowo w ustawieniach e-maila, jeśli sesja nadal działa.",
      },
      { headers },
    );
  } catch (error) {
    await reportError(error, { source: "account.delete", requestId });
    return Response.json(
      { error: "Nie udało się usunąć konta." },
      { status: 500, headers },
    );
  }
}
