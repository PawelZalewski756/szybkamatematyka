import type { TaskForClient } from "@/lib/baza-zadan/types";

/**
 * Zadanie powtórki dla klienta.
 *
 * `hasSolution` mówi tylko, czy istnieje rozwiązanie krok po kroku. Same kroki
 * nie wychodzą z serwera - Pro pobiera je osobno przez
 * `/api/trening/task-solution`, tak jak w bazie zadań.
 */
export type ReviewTask = TaskForClient & { hasSolution: boolean };

const MAX_IDS_PER_REQUEST = 100;

async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? "Nie udało się pobrać zadań.");
  }
  return data;
}

/** Pobiera zadania po ID; dzieli na paczki, żeby nie przekroczyć limitu API. */
export async function fetchReviewTasksByIds(
  ids: readonly string[],
  signal?: AbortSignal,
): Promise<ReviewTask[]> {
  if (ids.length === 0) return [];

  const unique = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let index = 0; index < unique.length; index += MAX_IDS_PER_REQUEST) {
    chunks.push(unique.slice(index, index + MAX_IDS_PER_REQUEST));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      postJson<{ tasks: ReviewTask[] }>(
        "/api/powtorki/tasks",
        { ids: chunk },
        signal,
      ).then((data) => data.tasks ?? []),
    ),
  );

  return results.flat();
}

/** Lista zadań do dodania do powtórek: wyszukiwanie albo podpowiedzi. */
export async function fetchReviewCatalog(
  path: "sp" | "srednia",
  options: {
    search?: string;
    solvedIds?: readonly string[];
    signal?: AbortSignal;
  } = {},
): Promise<ReviewTask[]> {
  const data = await postJson<{ tasks: ReviewTask[] }>(
    "/api/powtorki/catalog",
    {
      path,
      search: options.search?.trim() ?? "",
      solvedIds: options.solvedIds ? [...options.solvedIds].slice(0, 100) : [],
    },
    options.signal,
  );
  return data.tasks ?? [];
}
