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
import { FREE_CMS_SHEETS_VISIBLE } from "@/lib/subscription/content-limits";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { ProGate } from "@/components/subscription/ProGate";
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
  const { isPro } = useSubscription();
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

  const visibleGroups = useMemo(() => {
    const flat = yearSections.flatMap((s) => s.groups);
    if (isPro) return { shown: flat, locked: [] as CmsArkuszGroup[] };
    return {
      shown: flat.slice(0, FREE_CMS_SHEETS_VISIBLE),
      locked: flat.slice(FREE_CMS_SHEETS_VISIBLE),
    };
  }, [yearSections, isPro]);

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
        description="Arkusze CKE dodajesz skryptem seed. Na razie korzystaj z zakładki Zadania i Arkusze treningowe."
      />
    );
  }

  const filtersSidebar = (
    <aside className="page-sidebar space-y-5 rounded-xl border border-surface-border bg-surface p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Filtry</p>
        <p className="text-sm tabular-nums text-muted">{filtered.length}</p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Typ egzaminu</p>
        <div className="flex flex-col gap-1.5">
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
          <label htmlFor="arkusz-rok" className="text-xs font-medium text-muted">
            Rok
          </label>
          <select
            id="arkusz-rok"
            value={year === "all" ? "all" : String(year)}
            onChange={(e) => {
              const v = e.target.value;
              setYear(v === "all" ? "all" : Number(v));
            }}
            className="input-field mt-1.5 w-full px-3 py-2 text-sm"
          >
            <option value="all">Wszystkie lata</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      <Link
        href="/trening/arkusze"
        className="block text-sm font-semibold text-accent hover:text-accent-strong"
      >
        Pełny katalog arkuszy →
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
        {yearSections.map((section) => {
          const shownIds = new Set(visibleGroups.shown.map((g) => g.arkuszId));
          const sectionShown = section.groups.filter((g) =>
            shownIds.has(g.arkuszId),
          );
          if (sectionShown.length === 0) return null;
          return (
            <section key={section.year || "bez-roku"}>
              {section.year > 0 ? (
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {section.year}
                </h3>
              ) : null}
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {sectionShown.map((group) => (
                  <li key={group.arkuszId}>
                    <BazaArkuszCard group={group} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {visibleGroups.locked.length > 0 && (
          <ProGate
            featureLabel={`Pełne archiwum arkuszy (${visibleGroups.locked.length} więcej)`}
          >
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {visibleGroups.locked.map((group) => (
                <li key={group.arkuszId}>
                  <BazaArkuszCard group={group} />
                </li>
              ))}
            </ul>
          </ProGate>
        )}
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
