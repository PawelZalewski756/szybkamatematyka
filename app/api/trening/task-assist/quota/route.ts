import { readAssistQuota } from "@/lib/subscription/task-assist-quota";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/trening/task-assist/quota - pozostałe zapytania w bieżącym miesiącu. */
export async function GET(request: Request) {
  const auth = await verifyTaskAssistRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const quota = await readAssistQuota(auth.user.id, auth.isPro);
  return Response.json({ quota });
}
