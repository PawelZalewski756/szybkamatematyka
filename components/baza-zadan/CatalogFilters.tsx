"use client";

import {
  CATEGORY_LABELS,
  CORE_CATEGORIES,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import type { TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";
import type { ReactNode } from "react";

export type CatalogFilterState = {
  category: TaskCategory | "all";
  difficulty: TaskDifficulty | "all";
  search: string;
};

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  taskCount: number;
  sheetCount: number;
};

function Chip({
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
      className={`min-w-0 break-words rounded-full px-3 py-2 text-left text-xs font-bold transition-colors sm:text-sm ${
        active
          ? "bg-accent text-on-accent"
          : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogFilters({
  filters,
  onChange,
  taskCount,
  sheetCount,
}: CatalogFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Baza w aplikacji
          </h2>
          <p className="mt-1 text-2xl font-black text-foreground">{taskCount} zadań</p>
          <p className="mt-1 text-sm text-muted">{sheetCount} arkuszy</p>
        </div>

        <div>
          <label
            htmlFor="catalog-search"
            className="text-xs font-bold text-muted"
          >
            Szukaj
          </label>
          <input
            id="catalog-search"
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Tytuł lub treść…"
            className="input-field mt-2 w-full px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted">Trudność</p>
          <div className="flex flex-wrap gap-2">
            <Chip
              active={filters.difficulty === "all"}
              onClick={() => onChange({ ...filters, difficulty: "all" })}
            >
              Wszystkie
            </Chip>
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
              <Chip
                key={d}
                active={filters.difficulty === d}
                onClick={() => onChange({ ...filters, difficulty: d })}
              >
                {DIFFICULTY_LABELS[d]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted">Dział</p>
          <div className="flex flex-wrap gap-2">
            <Chip
              active={filters.category === "all"}
              onClick={() => onChange({ ...filters, category: "all" })}
            >
              Wszystkie
            </Chip>
            {CORE_CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={filters.category === c}
                onClick={() => onChange({ ...filters, category: c })}
              >
                {CATEGORY_LABELS[c]}
              </Chip>
            ))}
            <Chip
              active={filters.category === "egzamin-8"}
              onClick={() =>
                onChange({ ...filters, category: "egzamin-8" })
              }
            >
              {CATEGORY_LABELS["egzamin-8"]}
            </Chip>
            <Chip
              active={filters.category === "matura"}
              onClick={() => onChange({ ...filters, category: "matura" })}
            >
              {CATEGORY_LABELS.matura}
            </Chip>
          </div>
        </div>
    </div>
  );
}
