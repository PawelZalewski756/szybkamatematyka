import { createClient } from "@supabase/supabase-js";
import {
  hashVisitorId,
  isValidPagePath,
  isValidVisitorId,
} from "@/lib/analytics/page-view";

export const runtime = "nodejs";

type PageViewRequest = {
  visitorId?: unknown;
  path?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let payload: PageViewRequest;
  try {
    payload = (await request.json()) as PageViewRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidVisitorId(payload.visitorId) || !isValidPagePath(payload.path)) {
    return Response.json({ error: "Invalid page view." }, { status: 400 });
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
  const { error } = await supabase.rpc("record_page_view", {
    p_visitor_hash: hashVisitorId(payload.visitorId),
    p_page_path: payload.path,
  });

  if (error) {
    console.error("Failed to record page view:", error.message);
    return Response.json({ error: "Could not record page view." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
