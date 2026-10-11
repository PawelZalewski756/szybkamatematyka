import { createClient } from "@supabase/supabase-js";
import {
  hashVisitorId,
  isValidPagePath,
  isValidVisitorId,
} from "@/lib/analytics/page-view";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "signup_completed",
  "first_task_solved",
  "session_start",
]);

type AnalyticsEventRequest = {
  visitorId?: unknown;
  eventName?: unknown;
  path?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let payload: AnalyticsEventRequest;
  try {
    payload = (await request.json()) as AnalyticsEventRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    !isValidVisitorId(payload.visitorId) ||
    !isValidPagePath(payload.path) ||
    typeof payload.eventName !== "string" ||
    !ALLOWED_EVENTS.has(payload.eventName)
  ) {
    return Response.json({ error: "Invalid analytics event." }, { status: 400 });
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Analytics event recording requires server-side Supabase configuration.");
    return Response.json({ error: "Analytics is not configured." }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc("record_analytics_event", {
    p_visitor_hash: hashVisitorId(payload.visitorId),
    p_event_name: payload.eventName,
    p_page_path: payload.path,
  });

  if (error) {
    console.error("Failed to record analytics event:", error.message);
    return Response.json({ error: "Could not record analytics event." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
