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
    <aside className="page-sidebar space-y-6 rounded-2xl border border-surface-border bg-surface p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Filtry</p>
        <p className="mt-1 text-2xl font-black tabular-nums text-foreground">
          {tasks.length}
        </p>
        <p className="text-xs text-muted">
          {tasks.length === 1 ? "zadanie" : tasks.length < 5 ? "zadania" : "zadań"}
        </p>
      </div>

      <div>
        <label htmlFor="baza-search" className="text-xs font-bold text-muted">
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
          className="input-field mt-2 w-full px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Trudność</p>
        <div className="flex flex-wrap gap-2">
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
        <p className="mb-2 text-xs font-bold text-muted">Dział</p>
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
          <FilterChip
            active={category === "all"}
            onClick={() => {
              setCategory("all");
              resetPagination();
            }}
          >
            Wszystkie
          </FilterChip>
          {ALL_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={category === c}
              onClick={() => {
                setCategory(c);
                resetPagination();
              }}
            >
              {CATEGORY_LABELS[c]}
            </FilterChip>
          ))}
        </div>
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
    <div className="page-with-sidebar">
      {filtersSidebar}
      <div>{taskGrid}</div>
    </div>
  );
}
