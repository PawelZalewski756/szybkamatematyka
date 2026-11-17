import { NextResponse } from "next/server";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import { toClientTask } from "@/lib/baza-zadan/client-task";
import type { ReviewTask } from "@/lib/powtorki/tasks-client";

const MAX_IDS = 200;
const MAX_ID_LENGTH = 120;

function isValidIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_IDS &&
    value.every(
      (id) => typeof id === "string" && id.length > 0 && id.length <= MAX_ID_LENGTH,
    )
  );
}

/**
 * POST /api/powtorki/tasks
 *
 * Zwraca zadania po ID bez `solutionSteps`. Kroki rozwiązania zostają na
 * serwerze i Pro pobiera je osobno przez `/api/trening/task-solution`.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 });
  }

  const ids = (payload as { ids?: unknown } | null)?.ids;
  if (!isValidIds(ids)) {
    return NextResponse.json(
      { error: `Podaj od 1 do ${MAX_IDS} poprawnych ID zadań.` },
      { status: 400 },
    );
  }

  const tasks: ReviewTask[] = [];
  for (const id of [...new Set(ids)]) {
    const task = getTaskById(id);
    if (!task) continue;
    tasks.push({
      ...toClientTask(task),
      hasSolution: (task.solutionSteps?.length ?? 0) > 0,
    });
  }

  return NextResponse.json(
    { tasks },
    { headers: { "Cache-Control": "no-store" } },
  );
}
