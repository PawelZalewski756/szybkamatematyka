import { NextResponse } from "next/server";
import { getTaskById, getTasksForPath } from "@/lib/baza-zadan/catalog";
import { toClientTask } from "@/lib/baza-zadan/client-task";
import type { LearningPath } from "@/lib/learning-path";
import type { Task } from "@/lib/baza-zadan/types";
import type { ReviewTask } from "@/lib/powtorki/tasks-client";

const MAX_RESULTS = 40;
const MAX_SOLVED_IDS = 100;
const MAX_SEARCH_LENGTH = 120;

function toReviewTask(task: Task): ReviewTask {
  return {
    ...toClientTask(task),
    hasSolution: (task.solutionSteps?.length ?? 0) > 0,
  };
}

/**
 * POST /api/powtorki/catalog
 *
 * Lista zadań do dodania do powtórek. Wyszukiwanie i podpowiedzi (zadania
 * już rozwiązane) liczone są na serwerze, więc klient nie ciągnie całego
 * katalogu razem z rozwiązaniami.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 });
  }

  const body = (payload ?? {}) as {
    path?: unknown;
    search?: unknown;
    solvedIds?: unknown;
  };

  const path: LearningPath = body.path === "srednia" ? "srednia" : "sp";
  const search =
    typeof body.search === "string"
      ? body.search.trim().slice(0, MAX_SEARCH_LENGTH)
      : "";
  const solvedIds =
    Array.isArray(body.solvedIds) && body.solvedIds.length <= MAX_SOLVED_IDS
      ? body.solvedIds.filter((id): id is string => typeof id === "string")
      : [];

  let tasks;
  if (search) {
    tasks = getTasksForPath(path, { search });
  } else if (solvedIds.length > 0) {
    tasks = solvedIds
      .map((id) => getTaskById(id))
      .filter((task): task is Task => Boolean(task));
  } else {
    tasks = getTasksForPath(path);
  }

  return NextResponse.json(
    { tasks: tasks.slice(0, MAX_RESULTS).map(toReviewTask) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
