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
import { Search, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

const PAGE_SIZE = 18;

function polishCount(count: number): string {
  const absolute = Math.abs(count);
  const lastDigit = absolute % 10;
  const lastTwoDigits = absolute % 100;
  const form =
    absolute === 1
      ? "zadanie"
      : lastDigit >= 2 &&
          lastDigit <= 4 &&
          (lastTwoDigits < 10 || lastTwoDigits >= 20)
        ? "zadania"
        : "zadań";

  return `${count} ${form}`;
}

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
  const filtersActive =
    search.trim().length > 0 || category !== "all" || difficulty !== "all";

  const resetPagination = () => setVisibleCount(PAGE_SIZE);

  const filterControls = (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-5">
      <label htmlFor="baza-search" className="text-xs font-semibold text-muted">
        Szukaj zadań
      </label>
      <div className="relative mt-1.5">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="baza-search"
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPagination();
          }}
          placeholder="Tytuł lub treść…"
          className="input-field w-full py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
        <p className="text-xs font-semibold text-muted">Filtry szczegółowe</p>
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-ghost px-3 py-1.5 text-xs font-semibold"
        >
          {filtersOpen ? "Ukryj" : "Pokaż"}
        </button>
      </div>

      <div
        className={`${filtersOpen ? "mt-4 grid" : "hidden"} gap-4 border-t border-surface-border pt-4 lg:mt-4 lg:grid lg:grid-cols-2`}
      >
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">Trudność</p>
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
          <label htmlFor="baza-dzial" className="text-xs font-semibold text-muted">
            Dział
          </label>
          <select
            id="baza-dzial"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as TaskCategory | "all");
              resetPagination();
            }}
            className="input-field mt-1.5 w-full px-3 py-2.5 text-sm"
          >
            <option value="all">Wszystkie działy</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-4">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          Znaleziono{" "}
          <span className="font-semibold text-foreground">
            {polishCount(tasks.length)}
          </span>
        </p>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setDifficulty("all");
              resetPagination();
            }}
            className="text-sm font-semibold text-accent hover:text-accent-strong"
          >
            Wyczyść filtry
          </button>
        ) : null}
      </div>
    </div>
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    <div className="space-y-5">
      {filterControls}
      {taskGrid}
    </div>
  );
}
