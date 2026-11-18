"use client";

import { BazaZadanArkuszePanel } from "@/components/baza-zadan/BazaZadanArkuszePanel";
import { BazaZadanTasksPanel } from "@/components/baza-zadan/BazaZadanTasksPanel";
import { BazaZadanTreningPanel } from "@/components/baza-zadan/BazaZadanTreningPanel";
import { useLearningPath } from "@/components/LearningPathProvider";
import { SchoolLevelToggle } from "@/components/SchoolLevelToggle";
import { groupCmsTasksByArkusz } from "@/lib/baza-zadan/cke/group-cms-tasks";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchZadaniaCatalogSafe,
  type ZadanieWithArkusz,
} from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import type { CatalogTask } from "@/lib/baza-zadan/catalog-task";
import type { ExamSheet } from "@/lib/baza-zadan/types";
import type { LearningPath } from "@/lib/learning-path";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type BazaTab = "zadania" | "arkusze" | "trening";

type BazaZadanStats = {
  tasks: number;
  sheets: number;
};

type BazaZadanViewProps = {
  tasks: CatalogTask[];
  stats: Record<LearningPath, BazaZadanStats>;
  sheetsByPath: Record<LearningPath, ExamSheet[]>;
  cmsTasks?: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

const TABS: readonly { id: BazaTab; label: string }[] = [
  { id: "zadania", label: "Ćwicz zadania" },
  { id: "arkusze", label: "Arkusze CKE" },
  { id: "trening", label: "Symulacje" },
];

function parseTab(value: string | null): BazaTab {
  if (value === "arkusze" || value === "trening") return value;
  return "zadania";
}

export function BazaZadanView({
  tasks,
  stats,
  sheetsByPath,
  cmsTasks: initialCmsTasks = [],
  schemaMissing = false,
  cmsNote: initialCmsNote = null,
}: BazaZadanViewProps) {
  const router = useRouter();
  const { path } = useLearningPath();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const [cmsTasks, setCmsTasks] = useState(initialCmsTasks);
  const [cmsLoadState, setCmsLoadState] = useState<"idle" | "ready">(
    initialCmsTasks.length > 0 || schemaMissing || Boolean(initialCmsNote)
      ? "ready"
      : "idle",
  );
  const [cmsSchemaMissing, setCmsSchemaMissing] = useState(schemaMissing);
  const [cmsNote, setCmsNote] = useState(initialCmsNote);
  const [runtimeSupabaseReady, setRuntimeSupabaseReady] = useState(() =>
    isSupabaseConfigured(),
  );

  useEffect(() => {
    if (runtimeSupabaseReady || isSupabaseConfigured()) return;

    const handleConfigReady = () => setRuntimeSupabaseReady(true);
    window.addEventListener("supabase-config-ready", handleConfigReady);
    return () =>
      window.removeEventListener("supabase-config-ready", handleConfigReady);
  }, [runtimeSupabaseReady]);

  useEffect(() => {
    if (
      tab !== "arkusze" ||
      !isSupabaseConfigured() ||
      cmsLoadState !== "idle"
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
        if (!cancelled) setCmsLoadState("ready");
      });

    return () => {
      cancelled = true;
    };
  }, [cmsLoadState, runtimeSupabaseReady, tab]);

  const cmsLoading =
    tab === "arkusze" &&
    cmsLoadState === "idle" &&
    isSupabaseConfigured();
  const taskCount = stats[path].tasks;
  const sheetCount = stats[path].sheets;
  const cmsArkuszCount = useMemo(
    () => groupCmsTasksByArkusz(cmsTasks).length,
    [cmsTasks],
  );

  const countValues: Record<BazaTab, string> = {
    zadania: String(taskCount),
    arkusze:
      cmsLoading ? "…" : cmsLoadState === "idle" ? "" : String(cmsArkuszCount),
    trening: String(sheetCount),
  };

  const setTab = (next: BazaTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "zadania") params.delete("tab");
    else params.set("tab", next);
    const q = params.toString();
    // `push`, nie `replaceState`: przełączenie zakładki ma być osobnym krokiem
    // w historii, żeby „wstecz” wracało do poprzedniej zakładki, a nie opuszczało
    // bazę zadań.
    router.push(q ? `/baza-zadan?${q}` : "/baza-zadan", { scroll: false });
  };

  return (
    <div className="page-container w-full py-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Baza zadań
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            Zadania z rozwiązaniami, oficjalne arkusze CKE i symulacje egzaminu -
            wszystko w jednym miejscu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-surface-border bg-surface px-3 py-2.5">
          <span
            id="baza-poziom-label"
            className="text-xs font-bold uppercase tracking-wide text-muted"
          >
            Poziom nauki
          </span>
          <SchoolLevelToggle labelledBy="baza-poziom-label" />
        </div>
      </header>

      <div className="mt-6 border-y border-surface-border py-3">
        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Sekcje bazy zadań"
        >
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                id={`baza-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="baza-zadan-panel"
                onClick={() => setTab(id)}
                className={`flex min-w-0 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-transparent text-muted hover:border-surface-border hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                {countValues[id] ? (
                  <span
                    aria-hidden="true"
                    className={`ml-auto min-w-6 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums ${
                      active
                        ? "bg-black/20 text-on-accent"
                        : "bg-surface-hover text-muted"
                    }`}
                  >
                    {countValues[id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="baza-zadan-panel"
        className="mt-6"
        role="tabpanel"
        aria-labelledby={`baza-tab-${tab}`}
      >
        {tab === "zadania" && <BazaZadanTasksPanel tasks={tasks} />}
        {tab === "arkusze" && (
          cmsLoading ? (
            <p className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-muted">
              Ładowanie arkuszy…
            </p>
          ) : (
            <BazaZadanArkuszePanel
              cmsTasks={cmsTasks}
              schemaMissing={cmsSchemaMissing}
              cmsNote={cmsNote}
            />
          )
        )}
        {tab === "trening" && (
          <BazaZadanTreningPanel sheets={sheetsByPath[path]} />
        )}
      </div>
    </div>
  );
}
