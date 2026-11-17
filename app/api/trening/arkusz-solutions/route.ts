import { formatSolutionForDisplay } from "@/lib/gemini/format-solution";
import { fetchZadaniaWithSolutions } from "@/lib/supabase/zadania-solutions-server";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/trening/arkusz-solutions
 *
 * Zwraca klucz całego arkusza tylko dla Pro. Strona wydruku nie dostaje już
 * rozwiązań w HTML - pobiera je po sprawdzeniu subskrypcji.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await verifyTaskAssistRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  if (!auth.isPro) {
    return Response.json(
      { error: "Klucz odpowiedzi jest dostępny w planie Pro." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const arkuszId =
    typeof body === "object" &&
    body !== null &&
    "arkuszId" in body &&
    typeof (body as { arkuszId?: unknown }).arkuszId === "string"
      ? (body as { arkuszId: string }).arkuszId.trim()
      : "";

  if (!arkuszId || arkuszId.length > 160) {
    return Response.json({ error: "Invalid sheet ID." }, { status: 400 });
  }

  const { data, error } = await fetchZadaniaWithSolutions({ arkuszId });
  if (error) {
    return Response.json({ error }, { status: 502 });
  }
  if (data.length === 0) {
    return Response.json({ error: "Sheet not found." }, { status: 404 });
  }

  return Response.json(
    {
      solutions: Object.fromEntries(
        data.map((task) => [task.id, formatSolutionForDisplay(task.rozwiazanie)]),
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
