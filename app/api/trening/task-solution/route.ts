import { getTaskById } from "@/lib/baza-zadan/catalog";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/trening/task-solution
 *
 * Zwraca pełne rozwiązanie zadania (archiwum CKE lub baza zadań) wyłącznie dla
 * planu Pro. Dzięki temu strony nie serializują `steps` do klienta, a paywall
 * nie jest już tylko ukrywaniem treści w UI.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await verifyTaskAssistRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  if (!auth.isPro) {
    return Response.json(
      { error: "Rozwiązania arkuszy CKE są dostępne w planie Pro." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const taskId =
    typeof body === "object" &&
    body !== null &&
    "taskId" in body &&
    typeof (body as { taskId?: unknown }).taskId === "string"
      ? (body as { taskId: string }).taskId.trim()
      : "";

  if (!taskId || taskId.length > 160) {
    return Response.json({ error: "Invalid task ID." }, { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    return Response.json({ error: "Task not found." }, { status: 404 });
  }

  return Response.json(
    {
      explanation: task.explanation ?? "",
      steps: task.solutionSteps ?? [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
