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
import { useMemo, useState } from "react";

type CmsScope = "matura" | "e8" | "inne";

type BazaZadanArkuszePanelProps = {
  cmsTasks: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

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
      <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Oficjalne arkusze z rozwiązaniami — każdy otwiera się na osobnej stronie.
        </p>
        <Link
          href="/trening/arkusze"
          className="text-sm font-semibold text-accent hover:text-accent-strong"
        >
          Widok pełnoekranowy →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {scopes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScope(s.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeScope === s.id
                ? "bg-accent/15 text-accent ring-1 ring-accent/25"
                : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {s.label}
            <span className="ml-1.5 tabular-nums text-slate-500">({s.count})</span>
          </button>
        ))}
      </div>

      {years.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Rok:</span>
          <button
            type="button"
            onClick={() => setYear("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              year === "all"
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Wszystkie
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                year === y
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
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
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                  {y}
                </h3>
              )}
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <li key={group.arkuszId}>
                    <BazaArkuszCard group={group} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
