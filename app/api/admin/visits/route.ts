import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  if (!auth.isAdmin) {
    return Response.json({ error: "Brak uprawnień." }, { status: 403 });
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
  const { data, error } = await supabase.rpc("get_daily_page_view_totals", {
    p_days: 30,
  });
  if (error) {
    return Response.json({ error: "Could not load visits." }, { status: 500 });
  }

  const rows = ((data ?? []) as { day: string; views: number | string }[]).map(
    (r) => ({ day: r.day, views: Number(r.views) || 0 }),
  );
  return Response.json({ rows });
}
