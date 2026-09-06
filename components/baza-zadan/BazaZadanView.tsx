"use client";

import { BazaZadanArkuszePanel } from "@/components/baza-zadan/BazaZadanArkuszePanel";
import { BazaZadanTasksPanel } from "@/components/baza-zadan/BazaZadanTasksPanel";
import { BazaZadanTreningPanel } from "@/components/baza-zadan/BazaZadanTreningPanel";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getTaskStats, getExamSheetsForPath } from "@/lib/baza-zadan/catalog";
import { groupCmsTasksByArkusz } from "@/lib/baza-zadan/cke/group-cms-tasks";
import { learningPathLabel } from "@/lib/learning-path";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchZadaniaCatalogSafe,
  type ZadanieWithArkusz,
} from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type BazaTab = "zadania" | "arkusze" | "trening";

type BazaZadanViewProps = {
  cmsTasks?: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

const TABS: { id: BazaTab; label: string; hint: string }[] = [
  {
    id: "zadania",
    label: "Ćwicz zadania",
    hint: "Pojedyncze zadania treningowe — filtruj po dziale i trudności.",
  },
  {
    id: "arkusze",
    label: "Arkusze CKE",
    hint: "Oficjalne matury i egzaminy z rozwiązaniami krok po kroku.",
  },
  {
    id: "trening",
    label: "Symulacje",
    hint: "Krótkie arkusze treningowe w aplikacji (E8 / matura MIX).",
  },
];

function parseTab(value: string | null): BazaTab {
  if (value === "arkusze" || value === "trening") return value;
  return "zadania";
}

export function BazaZadanView({
  cmsTasks: initialCmsTasks = [],
  schemaMissing = false,
  cmsNote: initialCmsNote = null,
}: BazaZadanViewProps) {
  const { path } = useLearningPath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const [cmsTasks, setCmsTasks] = useState(initialCmsTasks);
  const [cmsLoading, setCmsLoading] = useState(
    initialCmsTasks.length === 0 && isSupabaseConfigured(),
  );
  const [cmsSchemaMissing, setCmsSchemaMissing] = useState(schemaMissing);
  const [cmsNote, setCmsNote] = useState(initialCmsNote);

  useEffect(() => {
    if (
      tab !== "arkusze" ||
      !isSupabaseConfigured() ||
      cmsTasks.length > 0 ||
      cmsSchemaMissing ||
      cmsNote
    ) {
      return;
    }
    let cancelled = false;

    void fetchZadaniaCatalogSafe()
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          if (isSchemaMissingError(error)) {
            setCmsSchemaMissing(true);
          } else {
            setCmsNote(formatSupabaseErrorForUser(error));
          }
          return;
        }

        setCmsTasks(data);
      })
      .catch((error) => {
        if (cancelled) return;
        setCmsNote(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać arkuszy.",
        );
      })
      .finally(() => {
        if (!cancelled) setCmsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cmsNote, cmsSchemaMissing, cmsTasks.length, tab]);

  const pathLabel = learningPathLabel(path);
  const taskCount = getTaskStats(path).totalTasks;
  const sheetCount = getExamSheetsForPath(path).length;
  const cmsArkuszCount = useMemo(
    () => groupCmsTasksByArkusz(cmsTasks).length,
    [cmsTasks],
  );

  const counts: Record<BazaTab, number> = {
    zadania: taskCount,
    arkusze: cmsArkuszCount,
    trening: sheetCount,
  };

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  const setTab = (next: BazaTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "zadania") params.delete("tab");
    else params.set("tab", next);
    const q = params.toString();
    router.replace(q ? `/baza-zadan?${q}` : "/baza-zadan", { scroll: false });
  };

  return (
    <div className="page-container w-full py-8 sm:py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Baza zadań
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Ścieżka:{" "}
          <span className="font-semibold text-accent">{pathLabel}</span>.
          Wybierz zakładkę poniżej — każde miejsce służy do czegoś innego.
        </p>
      </header>

      <div
        className="mt-8 flex gap-1 overflow-x-auto border-b border-surface-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Sekcje bazy zadań"
      >
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
              <span className="ml-1.5 tabular-nums text-muted">
                {counts[id]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">{activeTab.hint}</p>

      <div className="mt-6" role="tabpanel">
        {tab === "zadania" && <BazaZadanTasksPanel />}
        {tab === "arkusze" && (
          cmsLoading ? (
            <p className="text-sm text-muted">Ładowanie arkuszy…</p>
          ) : (
            <BazaZadanArkuszePanel
              cmsTasks={cmsTasks}
              schemaMissing={cmsSchemaMissing}
              cmsNote={cmsNote}
            />
          )
        )}
        {tab === "trening" && <BazaZadanTreningPanel />}
      </div>
    </div>
  );
}
