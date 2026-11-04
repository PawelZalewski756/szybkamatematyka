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
      className={`filter-chip flex items-center justify-between gap-2 whitespace-nowrap text-left ${active ? "filter-chip-active" : ""}`}
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
        title="Brak arkuszy interaktywnych"
        description="Pełne oficjalne arkusze PDF oraz zasady oceniania znajdziesz w katalogu CKE."
        action={{
          label: "Otwórz katalog arkuszy CKE",
          href: "/trening/arkusze",
        }}
      />
    );
  }

  const filtersToolbar = (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-overline">Arkusze CKE</p>
          <p className="mt-1 text-sm text-muted" role="status" aria-live="polite">
            Wyświetlono{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "arkusz" : "arkuszy"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Typ egzaminu"
          >
            {scopes.map((s) => (
              <ScopeChip
                key={s.id}
                active={activeScope === s.id}
                onClick={() => setScope(s.id)}
              >
                <span>{s.label}</span>
                <span className="tabular-nums opacity-70">{s.count}</span>
              </ScopeChip>
            ))}
          </div>

          {years.length > 1 && (
            <div className="sm:min-w-40">
              <label htmlFor="arkusz-rok" className="sr-only">
                Rok
              </label>
              <select
                id="arkusz-rok"
                value={year === "all" ? "all" : String(year)}
                onChange={(e) => {
                  const v = e.target.value;
                  setYear(v === "all" ? "all" : Number(v));
                }}
                className="input-field w-full px-3 py-2 text-sm"
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
            className="text-sm font-semibold text-accent hover:text-accent-strong"
          >
            Pełny katalog →
          </Link>
        </div>
      </div>
    </div>
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
    <div className="space-y-5">
      {filtersToolbar}
      {cardsContent}
    </div>
  );
}
