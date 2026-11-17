import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { isOpenExamTask } from "@/lib/baza-zadan/cke/exam-points";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LETTERS = ["A", "B", "C", "D"];

/**
 * POST /api/trening/archive-solutions
 *
 * Klucz arkusza z archiwum CKE (dane statyczne w `lib/baza-zadan/exams`).
 * Wcześniej strona `/trening/arkusze/[id]/druk` wysyłała `explanation`
 * i `solutionSteps` w payloadzie RSC, więc klucz był dostępny dla każdego.
 * Teraz rozwiązania wychodzą wyłącznie stąd, po sprawdzeniu Pro.
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

  const sheetId =
    typeof body === "object" &&
    body !== null &&
    "sheetId" in body &&
    typeof (body as { sheetId?: unknown }).sheetId === "string"
      ? (body as { sheetId: string }).sheetId.trim()
      : "";

  if (!sheetId || sheetId.length > 160) {
    return Response.json({ error: "Invalid sheet ID." }, { status: 400 });
  }

  const sheet = getOfficialCkeSheetById(sheetId);
  if (!sheet) {
    return Response.json({ error: "Sheet not found." }, { status: 404 });
  }

  const tasks = getOfficialCkeSheetTasks(sheet.id);

  return Response.json(
    {
      answers: Object.fromEntries(
        tasks.map((task) => [
          task.id,
          isOpenExamTask(task) ? null : (LETTERS[task.correctIndex] ?? null),
        ]),
      ),
      solutions: Object.fromEntries(
        tasks.map((task) => [task.id, task.explanation ?? ""]),
      ),
      steps: Object.fromEntries(
        tasks.map((task) => [task.id, [...(task.solutionSteps ?? [])]]),
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
