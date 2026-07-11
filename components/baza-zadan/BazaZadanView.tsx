"use client";

import { BazaZadanArkuszePanel } from "@/components/baza-zadan/BazaZadanArkuszePanel";
import { BazaZadanTasksPanel } from "@/components/baza-zadan/BazaZadanTasksPanel";
import { BazaZadanTreningPanel } from "@/components/baza-zadan/BazaZadanTreningPanel";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getTaskStats, getExamSheetsForPath } from "@/lib/baza-zadan/catalog";
import { groupCmsTasksByArkusz } from "@/lib/baza-zadan/cke/group-cms-tasks";
import { learningPathLabel } from "@/lib/learning-path";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export type BazaTab = "zadania" | "arkusze" | "trening";

type BazaZadanViewProps = {
  cmsTasks: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

const TABS: { id: BazaTab; label: string }[] = [
  { id: "zadania", label: "Zadania" },
  { id: "arkusze", label: "Arkusze CKE" },
  { id: "trening", label: "Arkusze treningowe" },
];

function parseTab(value: string | null): BazaTab {
  if (value === "arkusze" || value === "trening") return value;
  return "zadania";
}

export function BazaZadanView({
  cmsTasks,
  schemaMissing = false,
  cmsNote,
}: BazaZadanViewProps) {
  const { path } = useLearningPath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

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
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Baza zadań
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Zadania treningowe, oficjalne arkusze CKE i arkusze w aplikacji — dla
          ścieżki{" "}
          <span className="font-semibold text-accent">{pathLabel}</span>.
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

      <div className="mt-8" role="tabpanel">
        {tab === "zadania" && <BazaZadanTasksPanel />}
        {tab === "arkusze" && (
          <BazaZadanArkuszePanel
            cmsTasks={cmsTasks}
            schemaMissing={schemaMissing}
            cmsNote={cmsNote}
          />
        )}
        {tab === "trening" && <BazaZadanTreningPanel />}
      </div>
    </div>
  );
}
