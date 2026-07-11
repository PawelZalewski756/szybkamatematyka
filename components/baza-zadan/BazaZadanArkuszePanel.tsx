"use client";

import { BazaArkuszCard } from "@/components/baza-zadan/BazaArkuszCard";
import { DatabaseSetupCard } from "@/components/baza-zadan/DatabaseSetupCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  groupCmsTasksByYear,
  isCkeMaturaArkusz,
  splitCmsTasks,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type CmsScope = "matura" | "e8" | "inne";

type BazaZadanArkuszePanelProps = {
  cmsTasks: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

function ScopeChip({
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
      className={`filter-chip w-full text-left sm:w-auto ${active ? "filter-chip-active" : ""}`}
    >
      {children}
    </button>
  );
}

function filterGroups(
  groups: CmsArkuszGroup[],
  scope: CmsScope,
  year: number | "all",
): CmsArkuszGroup[] {
  let list = groups;

  if (scope === "matura") {
    list = list.filter((g) => g.typ === "matura" && g.tasks[0] && isCkeMaturaArkusz(g.tasks[0]));
  } else if (scope === "e8") {
    list = list.filter((g) => g.typ === "egzamin-8");
  } else {
    list = list.filter(
      (g) =>
        g.typ !== "egzamin-8" &&
        !(g.typ === "matura" && g.tasks[0] && isCkeMaturaArkusz(g.tasks[0])),
    );
  }

  if (year === "all") return list;

  return list.filter((g) => g.tasks[0]?.arkusz.rok === year);
}

export function BazaZadanArkuszePanel({
  cmsTasks,
  schemaMissing = false,
  cmsNote,
}: BazaZadanArkuszePanelProps) {
  const [scope, setScope] = useState<CmsScope>("matura");
  const [year, setYear] = useState<number | "all">("all");

  const { ckeGroups, otherGroups } = useMemo(
    () => splitCmsTasks(cmsTasks),
    [cmsTasks],
  );

  const allGroups = useMemo(
    () => [...ckeGroups, ...otherGroups],
    [ckeGroups, otherGroups],
  );

  const counts = useMemo(
    () => ({
      matura: ckeGroups.length,
      e8: otherGroups.filter((g) => g.typ === "egzamin-8").length,
      inne: otherGroups.filter(
        (g) =>
          g.typ !== "egzamin-8" &&
          !(g.typ === "matura" && g.tasks[0] && isCkeMaturaArkusz(g.tasks[0])),
      ).length,
    }),
    [ckeGroups, otherGroups],
  );

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const g of allGroups) {
      const y = g.tasks[0]?.arkusz.rok;
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => b - a);
  }, [allGroups]);

  const scopes = useMemo(
    () =>
      (
        [
          { id: "matura" as const, label: "Matura CKE", count: counts.matura },
          { id: "e8" as const, label: "Egzamin 8 kl.", count: counts.e8 },
          { id: "inne" as const, label: "Pozostałe", count: counts.inne },
        ] satisfies { id: CmsScope; label: string; count: number }[]
      ).filter((s) => s.count > 0),
    [counts],
  );

  const activeScope: CmsScope = scopes.some((s) => s.id === scope)
    ? scope
    : (scopes[0]?.id ?? "matura");

  const filtered = useMemo(
    () => filterGroups(allGroups, activeScope, year),
    [allGroups, activeScope, year],
  );

  const yearSections = useMemo(
    () => groupCmsTasksByYear(filtered),
    [filtered],
  );

  if (schemaMissing) {
    return <DatabaseSetupCard />;
  }

  if (cmsNote) {
    return (
      <p className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
        {cmsNote}
      </p>
    );
  }

  if (allGroups.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Brak arkuszy w bazie"
        description="Arkusze CKE dodajesz w panelu admina albo przez skrypt seed. Na razie korzystaj z zakładki Zadania i Arkusze treningowe."
      />
    );
  }

  const filtersSidebar = (
    <aside className="page-sidebar space-y-5 rounded-2xl border border-surface-border bg-surface p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Arkusze</p>
        <p className="mt-1 text-2xl font-black tabular-nums text-foreground">
          {filtered.length}
        </p>
        <p className="text-xs text-muted">w wybranym filtrze</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Typ egzaminu</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
          {scopes.map((s) => (
            <ScopeChip
              key={s.id}
              active={activeScope === s.id}
              onClick={() => setScope(s.id)}
            >
              {s.label}{" "}
              <span className="tabular-nums opacity-70">({s.count})</span>
            </ScopeChip>
          ))}
        </div>
      </div>

      {years.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-bold text-muted">Rok</p>
          <div className="flex flex-wrap gap-2">
            <ScopeChip active={year === "all"} onClick={() => setYear("all")}>
              Wszystkie
            </ScopeChip>
            {years.map((y) => (
              <ScopeChip key={y} active={year === y} onClick={() => setYear(y)}>
                {y}
              </ScopeChip>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/trening/arkusze"
        className="block text-sm font-semibold text-accent hover:text-accent-strong"
      >
        Widok pełnoekranowy →
      </Link>
    </aside>
  );

  const cardsContent =
    filtered.length === 0 ? (
      <EmptyState
        icon={FileQuestion}
        title="Brak arkuszy w tym filtrze"
        description="Wybierz inny rok lub typ egzaminu."
      />
    ) : (
      <div className="space-y-8">
        {yearSections.map(({ year: y, groups }) => (
          <section key={y}>
            {year === "all" && yearSections.length > 1 && (
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                {y}
              </h3>
            )}
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => (
                <li key={group.arkuszId}>
                  <BazaArkuszCard group={group} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted lg:hidden">
        Oficjalne arkusze z rozwiązaniami — każdy otwiera się na osobnej stronie.
      </p>

      <div className="page-with-sidebar">
        {filtersSidebar}
        <div>
          <p className="mb-5 hidden text-sm text-muted lg:block">
            Oficjalne arkusze z rozwiązaniami — każdy otwiera się na osobnej
            stronie.
          </p>
          {cardsContent}
        </div>
      </div>
    </div>
  );
}
