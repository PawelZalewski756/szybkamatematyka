import { createClient } from "@supabase/supabase-js";
import { isCountablePath, isValidCountedPath } from "@/lib/analytics/visit-counter";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let payload: { path?: unknown };
  try {
    payload = (await request.json()) as { path?: unknown };
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidCountedPath(payload.path) || !isCountablePath(payload.path)) {
    return Response.json({ error: "Invalid path." }, { status: 400 });
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return Response.json({ error: "Analytics is not configured." }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc("record_daily_page_view", {
    p_page_path: payload.path,
  });
  if (error) {
    console.error("Failed to record visit:", error.message);
    return Response.json({ error: "Could not record visit." }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
