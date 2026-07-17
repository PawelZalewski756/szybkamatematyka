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
import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

const PAGE_SIZE = 30;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function BazaZadanTasksPanel() {
  const { path } = useLearningPath();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const resetPagination = () => setVisibleCount(PAGE_SIZE);

  const filtersSidebar = (
    <aside className="page-sidebar space-y-5 rounded-xl border border-surface-border bg-surface p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Filtry</p>
        <p className="text-sm tabular-nums text-muted">
          {tasks.length}{" "}
          {tasks.length === 1 ? "zadanie" : tasks.length < 5 ? "zadania" : "zadań"}
        </p>
      </div>

      <div>
        <label htmlFor="baza-search" className="text-xs font-medium text-muted">
          Szukaj
        </label>
        <input
          id="baza-search"
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPagination();
          }}
          placeholder="Tytuł lub treść…"
          className="input-field mt-1.5 w-full px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Trudność</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={difficulty === "all"}
            onClick={() => {
              setDifficulty("all");
              resetPagination();
            }}
          >
            Wszystkie
          </FilterChip>
          {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
            <FilterChip
              key={d}
              active={difficulty === d}
              onClick={() => {
                setDifficulty(d);
                resetPagination();
              }}
            >
              {DIFFICULTY_LABELS[d]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="baza-dzial" className="text-xs font-medium text-muted">
          Dział
        </label>
        <select
          id="baza-dzial"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as TaskCategory | "all");
            resetPagination();
          }}
          className="input-field mt-1.5 w-full px-3 py-2 text-sm"
        >
          <option value="all">Wszystkie działy</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );

  const taskGrid = (
    <div>
      {tasks.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Brak zadań"
          description="Zmień filtry albo wyszukiwaną frazę."
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="btn-ghost px-6 py-2.5 text-sm font-semibold"
              >
                Pokaż więcej ({tasks.length - visibleCount} pozostało)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-ghost w-full justify-between px-4 py-2.5 text-sm font-semibold"
        >
          {filtersOpen ? "Ukryj filtry" : "Pokaż filtry"}
          <span className="tabular-nums text-muted">{tasks.length}</span>
        </button>
        {filtersOpen ? <div className="mt-3">{filtersSidebar}</div> : null}
      </div>

      <div className="page-with-sidebar">
        <div className="hidden lg:block">{filtersSidebar}</div>
        <div>{taskGrid}</div>
      </div>
    </div>
  );
}
