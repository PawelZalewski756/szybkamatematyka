"use client";

import { DZIALY_MATEMATYKI, TYP_EGZAMINU_LABELS, type TypEgzaminu } from "@/lib/baza-zadan/dzialy";
import type { ReactNode } from "react";

export type BazaZadanFilterState = {
  typ: TypEgzaminu | "all";
  rok: number | "all";
  dzial: string | "all";
};

type BazaZadanFiltersProps = {
  filters: BazaZadanFilterState;
  onChange: (next: BazaZadanFilterState) => void;
  availableYears: number[];
  taskCount: number;
};

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
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
        active
          ? "bg-accent text-on-accent"
          : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function BazaZadanFilters({
  filters,
  onChange,
  availableYears,
  taskCount,
}: BazaZadanFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
          Filtry
        </h2>
        <p className="mt-1 text-2xl font-black text-foreground">{taskCount} zadań</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Typ egzaminu</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filters.typ === "all"}
            onClick={() => onChange({ ...filters, typ: "all" })}
          >
            Wszystkie
          </FilterChip>
          {(Object.keys(TYP_EGZAMINU_LABELS) as TypEgzaminu[]).map((t) => (
            <FilterChip
              key={t}
              active={filters.typ === t}
              onClick={() => onChange({ ...filters, typ: t })}
            >
              {TYP_EGZAMINU_LABELS[t]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Rok</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filters.rok === "all"}
            onClick={() => onChange({ ...filters, rok: "all" })}
          >
            Wszystkie
          </FilterChip>
          {availableYears.map((y) => (
            <FilterChip
              key={y}
              active={filters.rok === y}
              onClick={() => onChange({ ...filters, rok: y })}
            >
              {y}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Dział</p>
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
          <FilterChip
            active={filters.dzial === "all"}
            onClick={() => onChange({ ...filters, dzial: "all" })}
          >
            Wszystkie
          </FilterChip>
          {DZIALY_MATEMATYKI.map((d) => (
            <FilterChip
              key={d}
              active={filters.dzial === d}
              onClick={() => onChange({ ...filters, dzial: d })}
            >
              {d}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );
}
