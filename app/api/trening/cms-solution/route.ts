import { getSupabaseOrNull } from "@/lib/supabase";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/trening/cms-solution
 *
 * Zwraca rozwiązanie zadania z CMS (`zadania.rozwiazanie`) tylko dla Pro.
 * Dzięki temu `CmsTaskCard` nie dostaje treści w propsach z serwera.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await verifyTaskAssistRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  if (!auth.isPro) {
    return Response.json(
      { error: "Rozwiązania z bazy CKE są dostępne w planie Pro." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const zadanieId =
    typeof body === "object" &&
    body !== null &&
    "zadanieId" in body &&
    typeof (body as { zadanieId?: unknown }).zadanieId === "string"
      ? (body as { zadanieId: string }).zadanieId.trim()
      : "";

  if (!zadanieId || zadanieId.length > 160) {
    return Response.json({ error: "Invalid task ID." }, { status: 400 });
  }

  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return Response.json({ error: "Baza jest chwilowo niedostępna." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("zadania")
    .select("rozwiazanie")
    .eq("id", zadanieId)
    .maybeSingle();

  if (error) {
    console.error("[cms-solution] load failed:", error);
    return Response.json({ error: "Nie udało się pobrać rozwiązania." }, { status: 502 });
  }
  if (!data) {
    return Response.json({ error: "Task not found." }, { status: 404 });
  }

  return Response.json(
    { solution: String(data.rozwiazanie ?? "") },
    { headers: { "Cache-Control": "no-store" } },
  );
}
