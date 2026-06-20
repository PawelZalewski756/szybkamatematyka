"use client";

import { TaskCard } from "@/components/baza-zadan/TaskCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getTasksForPath } from "@/lib/baza-zadan/catalog";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import type { TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";
import { SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

const PAGE_SIZE = 30;

export function BazaZadanTasksPanel() {
  const { path } = useLearningPath();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const deferredSearch = useDeferredValue(search);

  const tasks = useMemo(
    () =>
      getTasksForPath(path, {
        category,
        difficulty,
        search: deferredSearch,
      }),
    [path, category, difficulty, deferredSearch],
  );

  const visible = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="baza-search" className="text-xs font-semibold text-slate-500">
            Szukaj
          </label>
          <input
            id="baza-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Tytuł lub treść zadania…"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111820] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-500/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
          <div>
            <label htmlFor="baza-category" className="text-xs font-semibold text-slate-500">
              Dział
            </label>
            <select
              id="baza-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as TaskCategory | "all");
                setVisibleCount(PAGE_SIZE);
              }}
              className="mt-1.5 w-full min-w-[9rem] cursor-pointer rounded-xl border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-teal-500/40"
            >
              <option value="all">Wszystkie działy</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="baza-difficulty" className="text-xs font-semibold text-slate-500">
              Trudność
            </label>
            <select
              id="baza-difficulty"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as TaskDifficulty | "all");
                setVisibleCount(PAGE_SIZE);
              }}
              className="mt-1.5 w-full min-w-[8rem] cursor-pointer rounded-xl border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-teal-500/40"
            >
              <option value="all">Dowolna</option>
              {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        <span className="font-semibold tabular-nums text-slate-300">{tasks.length}</span>{" "}
        {tasks.length === 1 ? "zadanie" : tasks.length < 5 ? "zadania" : "zadań"}
        {deferredSearch.trim() ? ` dla „${deferredSearch.trim()}”` : ""}
      </p>

      {tasks.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Brak zadań"
          description="Zmień filtry albo wyszukiwaną frazę."
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500/30 hover:bg-teal-500/10 hover:text-white"
              >
                Pokaż więcej ({tasks.length - visibleCount} pozostało)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
