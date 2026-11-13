"use client";

import { TaskCard } from "@/components/baza-zadan/TaskCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useLearningPath } from "@/components/LearningPathProvider";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { getTasksForPath } from "@/lib/baza-zadan/catalog";
import type { LearningPath } from "@/lib/learning-path";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import {
  TASK_CATEGORY_GROUPS,
  type TaskCategoryGroupId,
} from "@/lib/baza-zadan/sections";
import { getTaskTopic } from "@/lib/baza-zadan/topics";
import type { TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";

const PAGE_SIZE = 12;

type SortMode = "default" | "easy" | "hard" | "az";

const DIFFICULTY_ORDER: Record<TaskDifficulty, number> = {
  latwy: 0,
  sredni: 1,
  trudny: 2,
};

function pageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const visible = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...visible]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];

  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1]! > 1) out.push("ellipsis");
    out.push(page);
  });

  return out;
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

export function BazaZadanTasksPanel({
  level,
}: {
  level?: LearningPath;
}) {
  const { path } = useLearningPath();
  const activePath = level ?? path;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "all">("all");
  const [selectedGroup, setSelectedGroup] =
    useState<TaskCategoryGroupId | null>(null);
  const [topic, setTopic] = useState("all");
  const [showAllGroupTasks, setShowAllGroupTasks] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortMode>("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLElement | null>(null);
  const { solvedIds } = useSolvedTasks();

  const deferredSearch = useDeferredValue(search);
  const allTasks = useMemo(() => getTasksForPath(activePath), [activePath]);
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

  const groupCategories = selectedGroupDefinition?.categories;

  const baseTasks = useMemo(() => {
    return getTasksForPath(activePath, { search: deferredSearch }).filter((task) => {
      if (category !== "all" && task.category !== category) return false;
      if (groupCategories && !groupCategories.includes(task.category)) {
        return false;
      }
      return true;
    });
  }, [activePath, category, deferredSearch, groupCategories]);

  const topicTasks = useMemo(() => {
    if (topic === "all") return baseTasks;
    return baseTasks.filter((task) => getTaskTopic(task.title) === topic);
  }, [baseTasks, topic]);

  const tasks = useMemo(() => {
    if (difficulty === "all") return topicTasks;
    return topicTasks.filter((task) => task.difficulty === difficulty);
  }, [difficulty, topicTasks]);

  const topicOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of baseTasks) {
      const name = getTaskTopic(task.title);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pl"),
    );
  }, [baseTasks]);

  const sortedTasks = useMemo(() => {
    const copy = [...tasks];
    if (sort === "easy") {
      copy.sort(
        (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty],
      );
    } else if (sort === "hard") {
      copy.sort(
        (a, b) => DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty],
      );
    } else if (sort === "az") {
      copy.sort((a, b) => a.title.localeCompare(b.title, "pl"));
    }
    return copy;
  }, [sort, tasks]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<TaskDifficulty, number> = {
      latwy: 0,
      sredni: 0,
      trudny: 0,
    };
    for (const task of topicTasks) counts[task.difficulty] += 1;
    return counts;
  }, [topicTasks]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<TaskCategory, number>();
    if (!selectedGroupDefinition) return counts;
    for (const task of allTasks) {
      if (!selectedGroupDefinition.categories.includes(task.category)) continue;
      counts.set(task.category, (counts.get(task.category) ?? 0) + 1);
    }
    return counts;
  }, [allTasks, selectedGroupDefinition]);

  const groupTaskCount = selectedGroupDefinition
    ? [...categoryCounts.values()].reduce((sum, count) => sum + count, 0)
    : allTasks.length;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedTasks.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pageList = pageNumbers(currentPage, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageTasks = sortedTasks.slice(pageStart, pageStart + PAGE_SIZE);
  const firstNumber = sortedTasks.length === 0 ? 0 : pageStart + 1;
  const lastNumber = Math.min(pageStart + PAGE_SIZE, sortedTasks.length);
  const solvedInResults = sortedTasks.filter((task) =>
    solvedIds.has(task.id),
  ).length;
  const progressPercent =
    sortedTasks.length === 0
      ? 0
      : Math.round((solvedInResults / sortedTasks.length) * 100);

  const hasIntent =
    selectedGroup !== null ||
    category !== "all" ||
    topic !== "all" ||
    difficulty !== "all" ||
    search.trim().length > 0;
  const showTopicDirectory =
    Boolean(selectedGroupDefinition) &&
    topic === "all" &&
    difficulty === "all" &&
    !search.trim() &&
    !showAllGroupTasks;
  const resultTitle =
    topic !== "all"
      ? topic
      : selectedGroupDefinition
        ? `Zadania: ${selectedGroupDefinition.label}`
        : search.trim()
          ? "Wyniki wyszukiwania"
          : category !== "all"
            ? CATEGORY_LABELS[category]
            : "Wybrane zadania";

  const resetPagination = () => setPage(1);

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages);
    setPage(target);
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const clearSelection = () => {
    setSearch("");
    setCategory("all");
    setTopic("all");
    setDifficulty("all");
    setSelectedGroup(null);
    setShowAllGroupTasks(false);
    resetPagination();
  };

  const chooseGroup = (groupId: TaskCategoryGroupId) => {
    setSearch("");
    setCategory("all");
    setTopic("all");
    setDifficulty("all");
    setSelectedGroup(groupId);
    setShowAllGroupTasks(false);
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
            setTopic("all");
            setSelectedGroup(null);
            setShowAllGroupTasks(false);
            resetPagination();
          }}
          placeholder="Np. równania, procenty, trójkąt…"
          className="input-field w-full py-3 pl-10 pr-3 text-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
          className="mt-5 border-t border-surface-border pt-5"
        >
          <div className="max-w-sm">
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
                setTopic("all");
                setSelectedGroup(null);
                setShowAllGroupTasks(false);
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
    <section ref={resultsRef} aria-labelledby="baza-zadan-results-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-overline">Wyniki</p>
          <h2
            id="baza-zadan-results-heading"
            className="mt-1 text-xl font-black text-foreground"
          >
            {resultTitle}
          </h2>
          {selectedGroupDefinition ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              {selectedGroupDefinition.description}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-muted" role="status" aria-live="polite">
            Znaleziono{" "}
            <span className="font-semibold text-foreground">
              {polishCount(sortedTasks.length)}
            </span>
          </p>
          <div className="mt-3 max-w-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Postęp</span>
              <span className="tabular-nums">
                {solvedInResults}/{sortedTasks.length}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-border">
              <div
                className="h-full rounded-full bg-success transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showTopicDirectory ? (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                Temat
                <select
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value);
                    setShowAllGroupTasks(false);
                    resetPagination();
                  }}
                  className="input-field max-w-[18rem] py-1.5 text-xs"
                >
                  <option value="all">
                    Wszystkie tematy ({baseTasks.length})
                  </option>
                  {topicOptions.map(([name, count]) => (
                    <option key={name} value={name}>
                      {name} ({count})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                Sortuj
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SortMode);
                    resetPagination();
                  }}
                  className="input-field py-1.5 text-xs"
                >
                  <option value="default">Polecane</option>
                  <option value="easy">Najłatwiejsze</option>
                  <option value="hard">Najtrudniejsze</option>
                  <option value="az">Alfabetycznie</option>
                </select>
              </label>
            </>
          ) : null}
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-strong"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Wróć do katalogu
          </button>
        </div>
      </div>

      {selectedGroupDefinition &&
      selectedGroupDefinition.categories.length > 1 ? (
        <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-surface-border pt-4">
          <span className="mr-1 text-xs font-semibold text-muted">Dział:</span>
          <FilterChip
            active={category === "all"}
            onClick={() => {
              setCategory("all");
              setTopic("all");
              setShowAllGroupTasks(false);
              resetPagination();
            }}
          >
            Wszystkie
            <span className="ml-1 tabular-nums opacity-70">{groupTaskCount}</span>
          </FilterChip>
          {selectedGroupDefinition.categories.map((groupCategory) => (
            <FilterChip
              key={groupCategory}
              active={category === groupCategory}
              onClick={() => {
                setCategory(groupCategory);
                setTopic("all");
                setShowAllGroupTasks(false);
                resetPagination();
              }}
            >
              {CATEGORY_LABELS[groupCategory]}
              <span className="ml-1 tabular-nums opacity-70">
                {categoryCounts.get(groupCategory) ?? 0}
              </span>
            </FilterChip>
          ))}
        </div>
      ) : null}

      {showTopicDirectory ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-surface-border pt-4">
            <div>
              <p className="text-overline">Tematy</p>
              <h3 className="mt-1 text-lg font-bold text-foreground">
                Wybierz temat
              </h3>
            </div>
            <p className="text-sm text-muted">
              {topicOptions.length} tematów
            </p>
          </div>

          {topicOptions.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={SearchX}
                title="Brak tematów"
                description="Zmień dział albo wyczyść filtr i spróbuj ponownie."
              />
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topicOptions.map(([name, count]) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => {
                      setTopic(name);
                      setShowAllGroupTasks(false);
                      resetPagination();
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 text-left transition hover:border-accent/35 hover:bg-surface-hover"
                  >
                    <span className="min-w-0 text-sm font-semibold text-foreground">
                      {name}
                    </span>
                    <span className="shrink-0 rounded-md bg-surface-hover px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">
                      {count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {baseTasks.length > 0 ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowAllGroupTasks(true);
                  resetPagination();
                }}
                className="btn-ghost px-5 py-2.5 text-sm font-semibold"
              >
                Pokaż wszystkie {baseTasks.length} zadań
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-muted">Poziom:</span>
        <FilterChip
          active={difficulty === "all"}
          onClick={() => {
            setDifficulty("all");
            resetPagination();
          }}
        >
          Wszystkie
          <span className="ml-1 tabular-nums opacity-70">
            {topicTasks.length}
          </span>
        </FilterChip>
        {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((level) => (
          <FilterChip
            key={level}
            active={difficulty === level}
            onClick={() => {
              setDifficulty(level);
              resetPagination();
            }}
          >
            {DIFFICULTY_LABELS[level]}
            <span className="ml-1 tabular-nums opacity-70">
              {difficultyCounts[level]}
            </span>
          </FilterChip>
        ))}
      </div>

      {sortedTasks.length === 0 ? (
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
            {pageTasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              aria-label="Paginacja zadań"
              className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-xs text-muted">
                Strona{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                z {totalPages} · zadania {firstNumber}-{lastNumber} z{" "}
                {sortedTasks.length}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  aria-label="Poprzednia strona"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex h-8 min-w-8 items-center justify-center rounded-md border border-surface-border px-2 text-sm font-semibold text-muted transition hover:border-accent/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                {pageList.map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-xs text-muted"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      aria-current={item === currentPage ? "page" : undefined}
                      aria-label={`Strona ${item}`}
                      onClick={() => goToPage(item)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold tabular-nums transition ${
                        item === currentPage
                          ? "border-accent bg-accent text-on-accent"
                          : "border-surface-border text-muted hover:border-accent/40 hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Następna strona"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex h-8 min-w-8 items-center justify-center rounded-md border border-surface-border px-2 text-sm font-semibold text-muted transition hover:border-accent/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}
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
