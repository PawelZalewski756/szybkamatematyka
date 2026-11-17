"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import {
  fetchReviewCatalog,
  type ReviewTask,
} from "@/lib/powtorki/tasks-client";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function AddTasksPicker() {
  const { path } = useLearningPath();
  const { solvedIds } = useSolvedTasks();
  const { isInReview, addToReview, removeFromReview } = useReview();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Set rozwiązanych zadań zmienia tożsamość przy każdym zapisie - do efektu
  // przekazujemy stabilny klucz, a nie sam Set.
  const solvedKey = useMemo(
    () => [...solvedIds].slice(0, 100).join(","),
    [solvedIds],
  );

  useEffect(() => {
    const controller = new AbortController();
    const query = search.trim();
    const timer = setTimeout(
      () => {
        setLoading(true);
        fetchReviewCatalog(path, {
          search: query,
          solvedIds: solvedKey ? solvedKey.split(",") : [],
          signal: controller.signal,
        })
          .then((tasks) => {
            if (!controller.signal.aborted) setResults(tasks);
          })
          .catch((error: unknown) => {
            if (
              !controller.signal.aborted &&
              !(error instanceof DOMException && error.name === "AbortError")
            ) {
              setResults([]);
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 250 : 0,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, search, solvedKey]);

  return (
    <div className="rounded-3xl border border-surface-border bg-surface/60 p-5 sm:p-6">
      <h2 className="text-lg font-black text-foreground">Dodaj zadania do powtórek</h2>
      <p className="mt-1 text-sm text-muted">
        {search.trim()
          ? "Wyniki wyszukiwania w bazie zadań."
          : solvedIds.size > 0
            ? "Zadania, które już rozwiązywałeś - dodaj te, które chcesz utrwalić."
            : "Wyszukaj zadania, które chcesz powtarzać."}
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-surface-border bg-background px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po treści, tytule lub dziale…"
          className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted focus:outline-none"
        />
        {loading && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" aria-hidden />
        )}
      </div>

      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {!loading && results.length === 0 && (
          <li className="rounded-xl border border-surface-border bg-surface/50 px-4 py-3 text-sm text-muted">
            Brak zadań do wyświetlenia.
          </li>
        )}
        {results.map((task) => {
          const inReview = isInReview(task.id);
          return (
            <li key={task.id}>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {CATEGORY_LABELS[task.category]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    inReview
                      ? removeFromReview(task.id)
                      : addToReview(task.id)
                  }
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    inReview
                      ? "border-success/40 bg-success/15 text-success hover:bg-success/25"
                      : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                  }`}
                >
                  {inReview ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      W powtórkach
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Dodaj
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
