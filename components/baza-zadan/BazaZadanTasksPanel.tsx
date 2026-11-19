"use client";

import { TaskCard } from "@/components/baza-zadan/TaskCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useLearningPath } from "@/components/LearningPathProvider";
import type { CatalogTask } from "@/lib/baza-zadan/catalog-task";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import {
  TASK_CATEGORY_GROUPS,
} from "@/lib/baza-zadan/sections";
import { sortTasksForDisplay } from "@/lib/baza-zadan/task-order";
import type {
  TaskCategory,
  TaskDifficulty,
} from "@/lib/baza-zadan/types";
import { matchesLearningPath } from "@/lib/learning-path";
import { ArrowLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 9;

/**
 * Filtry katalogu przeżywają wejście w zadanie i powrót, żeby „wstecz”
 * z zadania nie wyrzucało ucznia na start katalogu.
 */
const FILTERS_STORAGE_KEY = "baza-zadan:filters:v2";
const SCROLL_STORAGE_KEY = "baza-zadan:scroll:v1";

type StoredFilters = {
  search: string;
  category: TaskCategory | null;
  difficulty: TaskDifficulty | "all";
};

function readStoredFilters(): StoredFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredFilters>;
    const category =
      typeof parsed.category === "string" && parsed.category in CATEGORY_LABELS
        ? (parsed.category as TaskCategory)
        : null;
    const difficulty =
      typeof parsed.difficulty === "string" &&
      parsed.difficulty in DIFFICULTY_LABELS
        ? (parsed.difficulty as TaskDifficulty)
        : "all";

    return {
      search:
        typeof parsed.search === "string" ? parsed.search.slice(0, 200) : "",
      category,
      difficulty,
    };
  } catch {
    return null;
  }
}

function storeFilters(filters: StoredFilters): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify(filters),
    );
  } catch {
    // Brak sessionStorage (tryb prywatny) - filtry zostają tylko w pamięci.
  }
}

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

export function BazaZadanTasksPanel({
  tasks: catalogTasks,
}: {
  tasks: CatalogTask[];
}) {
  const { path } = useLearningPath();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [restored, setRestored] = useState(false);

  // Odtworzenie filtrów po powrocie z zadania (po hydratacji, bez różnic SSR).
  useEffect(() => {
    const stored = readStoredFilters();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(stored.search);
      setCategory(stored.category);
      setDifficulty(stored.difficulty);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    storeFilters({ search, category, difficulty });
  }, [restored, search, category, difficulty]);

  // Po powrocie z zadania przywracamy pozycję listy.
  useEffect(() => {
    const saveScroll = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.('a[href^="/baza-zadan/"]')) return;
      try {
        window.sessionStorage.setItem(
          SCROLL_STORAGE_KEY,
          String(Math.round(window.scrollY)),
        );
      } catch {
        // brak sessionStorage - trudno, wracamy na górę
      }
    };
    document.addEventListener("click", saveScroll, true);
    return () => document.removeEventListener("click", saveScroll, true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);
      window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const offset = Number(stored);
    if (!Number.isFinite(offset) || offset <= 0) return;

    const id = window.setTimeout(() => window.scrollTo(0, offset), 60);
    return () => window.clearTimeout(id);
  }, [restored]);

  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  const allTasks = useMemo(
    () => catalogTasks.filter((task) => matchesLearningPath(path, task.paths)),
    [catalogTasks, path],
  );

  const countByCategory = useMemo(() => {
    const counts = new Map<TaskCategory, number>();
    for (const task of allTasks) {
      counts.set(task.category, (counts.get(task.category) ?? 0) + 1);
    }
    return counts;
  }, [allTasks]);

  const catalogGroups = useMemo(
    () =>
      TASK_CATEGORY_GROUPS.map((group) => {
        const entries = group.categories
          .map((id) => ({
            id,
            label: CATEGORY_LABELS[id],
            count: countByCategory.get(id) ?? 0,
          }))
          .filter((entry) => entry.count > 0);
        return {
          ...group,
          entries,
          taskCount: entries.reduce((sum, entry) => sum + entry.count, 0),
        };
      }).filter((group) => group.entries.length > 0),
    [countByCategory],
  );

  // Po zmianie poziomu nauki wybrany temat może nie istnieć w nowej ścieżce.
  // Wtedy wracamy do katalogu zamiast pokazywać pustą listę wyników.
  const activeCategory =
    category && countByCategory.has(category) ? category : null;

  const filteredTasks = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      if (activeCategory && task.category !== activeCategory) return false;
      if (difficulty !== "all" && task.difficulty !== difficulty) return false;
      if (!query) return true;
      return `${task.title} ${task.prompt} ${CATEGORY_LABELS[task.category]}`
        .toLowerCase()
        .includes(query);
    });

    return sortTasksForDisplay(filtered);
  }, [activeCategory, allTasks, difficulty, query]);

  const isBrowsingCatalog = !activeCategory && !query;
  const visible = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTasks.length;
  const hasFilters = difficulty !== "all" || query.length > 0;

  const resetPagination = () => setVisibleCount(PAGE_SIZE);

  const openCategory = (next: TaskCategory) => {
    setSearch("");
    setCategory(next);
    resetPagination();
  };

  const backToCatalog = () => {
    setSearch("");
    setCategory(null);
    setDifficulty("all");
    resetPagination();
  };

  const clearSearch = () => {
    setSearch("");
    resetPagination();
  };

  const resultTitle = query
    ? "Wyniki wyszukiwania"
    : activeCategory
      ? CATEGORY_LABELS[activeCategory]
      : "Wszystkie zadania";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="baza-search"
            type="search"
            aria-label="Szukaj po tytule lub treści"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCategory(null);
              resetPagination();
            }}
            placeholder="Szukaj zadania, np. procenty, trójkąt, równanie…"
            className="input-field w-full py-2.5 pl-10 pr-3 text-sm"
          />
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearSearch}
            className="self-start text-sm font-semibold text-accent hover:text-accent-strong sm:self-auto"
          >
            Wyczyść szukanie
          </button>
        ) : null}
      </div>

      {isBrowsingCatalog ? (
        <section aria-labelledby="baza-tematy-heading">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="baza-tematy-heading"
                className="text-lg font-extrabold text-foreground"
              >
                Wybierz temat
              </h2>
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground">
                {polishCount(allTasks.length)}
              </span>{" "}
              w {catalogGroups.length} obszarach
            </p>
          </div>

          <div className="mt-4 grid items-start gap-3 sm:grid-cols-2">
            {catalogGroups.map((group) => (
              <section
                key={group.id}
                data-testid={`baza-group-${group.id}`}
                className="overflow-hidden rounded-2xl border border-surface-border bg-surface"
              >
                {group.entries.length === 1 ? (
                  <button
                    type="button"
                    onClick={() => openCategory(group.entries[0]!.id)}
                    className="group flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface-hover"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-foreground group-hover:text-accent">
                        {group.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                      {group.taskCount}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 border-b border-surface-border px-4 py-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground">
                          {group.label}
                        </h3>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                        {group.taskCount}
                      </span>
                    </div>
                    <ul className="divide-y divide-surface-border">
                      {group.entries.map((entry) => (
                        <li key={entry.id}>
                          <button
                            type="button"
                            onClick={() => openCategory(entry.id)}
                            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-hover"
                          >
                            <span className="min-w-0 flex-1 text-sm font-semibold text-foreground group-hover:text-accent">
                              {entry.label}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-muted">
                              {entry.count}
                            </span>
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="baza-wyniki-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={backToCatalog}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-strong"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Wszystkie tematy
              </button>
              <h2
                id="baza-wyniki-heading"
                className="mt-1 text-xl font-extrabold text-foreground"
              >
                {resultTitle}
              </h2>
              <p className="mt-1 text-sm text-muted" role="status" aria-live="polite">
                {polishCount(filteredTasks.length)}
              </p>
            </div>

            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted">Poziom</span>
              <select
                aria-label="Filtr trudności"
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value as TaskDifficulty | "all");
                  resetPagination();
                }}
                className="input-field px-3 py-2 text-sm"
              >
                <option value="all">Wszystkie</option>
                {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={SearchX}
                title="Brak zadań"
                description="Zmień frazę albo wybierz inny temat i spróbuj ponownie."
              >
                <button
                  type="button"
                  onClick={backToCatalog}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  Wróć do tematów
                </button>
              </EmptyState>
            </div>
          ) : (
            <>
              <ul
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
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
                    Pokaż więcej ({filteredTasks.length - visibleCount} pozostało)
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      )}
    </div>
  );
}
