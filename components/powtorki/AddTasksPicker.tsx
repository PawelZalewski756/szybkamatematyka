"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { getTaskById, getTasksForPath } from "@/lib/baza-zadan/catalog";
import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import type { Task } from "@/lib/baza-zadan/types";
import { Check, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

const MAX_RESULTS = 40;

export function AddTasksPicker() {
  const { path } = useLearningPath();
  const { solvedIds } = useSolvedTasks();
  const { isInReview, addToReview, removeFromReview } = useReview();
  const [search, setSearch] = useState("");

  const results = useMemo<Task[]>(() => {
    const query = search.trim();
    if (query) {
      return getTasksForPath(path, { search: query }).slice(0, MAX_RESULTS);
    }
    // Bez wyszukiwania proponujemy zadania, które user już rozwiązywał.
    const suggested = [...solvedIds]
      .map((id) => getTaskById(id))
      .filter((t): t is Task => Boolean(t));
    if (suggested.length > 0) return suggested.slice(0, MAX_RESULTS);
    return getTasksForPath(path).slice(0, MAX_RESULTS);
  }, [search, path, solvedIds]);

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
      <h2 className="text-lg font-black text-white">Dodaj zadania do powtórek</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {search.trim()
          ? "Wyniki wyszukiwania w bazie zadań."
          : solvedIds.size > 0
            ? "Zadania, które już rozwiązywałeś — dodaj te, które chcesz utrwalić."
            : "Wyszukaj zadania, które chcesz powtarzać."}
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po treści, tytule lub dziale…"
          className="w-full bg-transparent text-sm font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {results.length === 0 && (
          <li className="rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-500">
            Brak zadań do wyświetlenia.
          </li>
        )}
        {results.map((task) => {
          const inReview = isInReview(task.id);
          return (
            <li key={task.id}>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-100">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-500">
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
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                      : "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
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
