"use client";

import { TaskCard } from "@/components/baza-zadan/TaskCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getTasksForPath } from "@/lib/baza-zadan/catalog";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import {
  TASK_CATEGORY_GROUPS,
  type TaskCategoryGroupId,
} from "@/lib/baza-zadan/sections";
import type { TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  SearchX,
  Shuffle,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

const PAGE_SIZE = 9;

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
  const router = useRouter();
  const { path } = useLearningPath();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "all">("all");
  const [selectedGroup, setSelectedGroup] =
    useState<TaskCategoryGroupId | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const allTasks = useMemo(() => getTasksForPath(path), [path]);
  const catalogGroups = useMemo(
    () =>
      TASK_CATEGORY_GROUPS.map((group) => ({
        ...group,
        taskCount: allTasks.filter((task) =>
          group.categories.includes(task.category),
        ).length,
      })).filter((group) => group.taskCount > 0),
    [allTasks],
  );
  const selectedGroupDefinition = selectedGroup
    ? TASK_CATEGORY_GROUPS.find((group) => group.id === selectedGroup)
    : undefined;

  const tasks = useMemo(() => {
    const groupCategories = selectedGroupDefinition?.categories;

    return getTasksForPath(path, {
      difficulty,
      search: deferredSearch,
    }).filter((task) => {
      if (category !== "all" && task.category !== category) return false;
      if (groupCategories && !groupCategories.includes(task.category)) {
        return false;
      }
      return true;
    });
  }, [
    category,
    deferredSearch,
    difficulty,
    path,
    selectedGroupDefinition,
  ]);

  const hasIntent =
    selectedGroup !== null ||
    category !== "all" ||
    difficulty !== "all" ||
    search.trim().length > 0;
  const visible = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;
  const resultTitle = selectedGroupDefinition
    ? `Zadania: ${selectedGroupDefinition.label}`
    : search.trim()
      ? "Wyniki wyszukiwania"
      : category !== "all"
        ? CATEGORY_LABELS[category]
        : "Wybrane zadania";

  const resetPagination = () => setVisibleCount(PAGE_SIZE);

  const clearSelection = () => {
    setSearch("");
    setCategory("all");
    setDifficulty("all");
    setSelectedGroup(null);
    resetPagination();
  };

  const chooseGroup = (groupId: TaskCategoryGroupId) => {
    setSearch("");
    setCategory("all");
    setDifficulty("all");
    setSelectedGroup(groupId);
    resetPagination();
  };

  const searchAndFilters = (
    <section
      className="border-b border-surface-border pb-6"
      aria-labelledby="baza-zadan-search-heading"
    >
      <div className="max-w-xl">
        <p className="text-overline">Zadania treningowe</p>
        <h2
          id="baza-zadan-search-heading"
          className="mt-1 text-lg font-bold text-foreground sm:text-xl"
        >
          Wybierz dział lub wyszukaj zadanie
        </h2>
        <p className="mt-2 text-sm text-muted">
          Zacznij od tematu albo wpisz szukaną frazę.
        </p>
      </div>

      <label
        htmlFor="baza-search"
        className="mt-5 block text-xs font-semibold text-muted"
      >
        Szukaj po tytule lub treści
      </label>
      <div className="relative mt-1.5 max-w-2xl">
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
            setSelectedGroup(null);
            resetPagination();
          }}
          placeholder="Np. równania, procenty, trójkąt…"
          className="input-field w-full py-3 pl-10 pr-3 text-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const pool =
              tasks.length > 0 ? tasks : getTasksForPath(path);
            if (pool.length === 0) return;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick) router.push(`/baza-zadan/${pick.id}`);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-on-accent shadow-sm transition hover:brightness-105"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Losowe zadanie
        </button>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="baza-zadan-detailed-filters"
          onClick={() => setFiltersOpen((open) => !open)}
          className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-xs font-bold"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {filtersOpen ? "Ukryj filtry" : "Doprecyzuj filtry"}
        </button>
        {hasIntent ? (
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm font-semibold text-accent hover:text-accent-strong"
          >
            Wyczyść wybór
          </button>
        ) : null}
      </div>

      {filtersOpen ? (
        <div
          id="baza-zadan-detailed-filters"
          className="mt-5 grid gap-5 border-t border-surface-border pt-5 sm:grid-cols-2"
        >
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">Trudność</p>
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
                    setSelectedGroup(null);
                    resetPagination();
                  }}
                >
                  {DIFFICULTY_LABELS[d]}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="baza-dzial"
              className="text-xs font-semibold text-muted"
            >
              Dział
            </label>
            <select
              id="baza-dzial"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as TaskCategory | "all");
                setSelectedGroup(null);
                resetPagination();
              }}
              className="input-field mt-1.5 w-full px-3 py-2.5 text-sm"
            >
              <option value="all">Wszystkie działy</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </section>
  );

  const catalog = (
    <section
      className="pt-5"
      aria-labelledby="baza-zadan-catalog-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-overline">Katalog tematów</p>
          <h2
            id="baza-zadan-catalog-heading"
            className="mt-1 text-lg font-bold text-foreground"
          >
            Od czego chcesz zacząć?
          </h2>
        </div>
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">
            {polishCount(allTasks.length)}
          </span>{" "}
          w tej ścieżce
        </p>
      </div>

      <ul className="mt-4 divide-y divide-surface-border border-y border-surface-border">
        {catalogGroups.map((group, index) => (
          <li key={group.id}>
            <button
              type="button"
              onClick={() => chooseGroup(group.id)}
              className="group flex w-full items-center gap-3 px-1 py-3.5 text-left transition hover:bg-surface-hover/60 sm:px-2"
              aria-label={`${group.label}, ${polishCount(group.taskCount)}`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold tabular-nums text-accent"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground group-hover:text-accent">
                  {group.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  {group.description}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-muted">
                  {polishCount(group.taskCount)}
                </span>
                <ChevronRight
                  className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  const results = (
    <section aria-labelledby="baza-zadan-results-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline">Wyniki</p>
          <h2
            id="baza-zadan-results-heading"
            className="mt-1 text-xl font-black text-foreground"
          >
            {resultTitle}
          </h2>
          <p className="mt-1 text-sm text-muted" role="status" aria-live="polite">
            Znaleziono{" "}
            <span className="font-semibold text-foreground">
              {polishCount(tasks.length)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-accent hover:text-accent-strong sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Wróć do katalogu
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="Brak zadań"
            description="Zmień frazę albo wybierz inny dział i spróbuj ponownie."
          />
        </div>
      ) : (
        <>
          <ul
            className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Wyniki zadań"
          >
            {visible.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="btn-ghost px-6 py-2.5 text-sm font-semibold"
              >
                Pokaż więcej ({tasks.length - visibleCount} pozostało)
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );

  return (
    <div className="space-y-5">
      {searchAndFilters}
      {hasIntent ? results : catalog}
    </div>
  );
}
