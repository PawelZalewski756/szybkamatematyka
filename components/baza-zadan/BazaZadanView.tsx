"use client";

import { BazaZadanArkuszePanel } from "@/components/baza-zadan/BazaZadanArkuszePanel";
import { BazaZadanTasksPanel } from "@/components/baza-zadan/BazaZadanTasksPanel";
import { BazaZadanTreningPanel } from "@/components/baza-zadan/BazaZadanTreningPanel";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getTaskStats, getExamSheetsForPath } from "@/lib/baza-zadan/catalog";
import { groupCmsTasksByArkusz } from "@/lib/baza-zadan/cke/group-cms-tasks";
import { learningPathLabel, type LearningPath } from "@/lib/learning-path";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchZadaniaCatalogSafe,
  type ZadanieWithArkusz,
} from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type BazaTab = "zadania" | "arkusze" | "trening";

type BazaZadanViewProps = {
  cmsTasks?: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  cmsNote?: string | null;
};

const TABS: readonly { id: BazaTab; label: string; hint: string }[] = [
  {
    id: "zadania",
    label: "Ćwicz zadania",
    hint: "Spokojny katalog tematów, wyszukiwarka i zadania odkrywane po wyborze.",
  },
  {
    id: "arkusze",
    label: "Arkusze CKE",
    hint: "Oficjalne matury i egzaminy z rozwiązaniami krok po kroku.",
  },
  {
    id: "trening",
    label: "Symulacje",
    hint: "Pełne arkusze treningowe w aplikacji (E8 / matura MIX).",
  },
];

function parseTab(value: string | null): BazaTab {
  if (value === "arkusze" || value === "trening") return value;
  return "zadania";
}

function polishCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const absolute = Math.abs(count);
  const lastDigit = absolute % 10;
  const lastTwoDigits = absolute % 100;
  const form =
    absolute === 1
      ? one
      : lastDigit >= 2 &&
          lastDigit <= 4 &&
          (lastTwoDigits < 10 || lastTwoDigits >= 20)
        ? few
        : many;

  return `${count} ${form}`;
}

export function BazaZadanView({
  cmsTasks: initialCmsTasks = [],
  schemaMissing = false,
  cmsNote: initialCmsNote = null,
}: BazaZadanViewProps) {
  const { path } = useLearningPath();
  const [levelOverride, setLevelOverride] = useState<LearningPath | null>(null);
  const level = levelOverride ?? path;
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
  const pathLabel = learningPathLabel(level);
  const taskCount = getTaskStats(level).totalTasks;
  const sheetCount = getExamSheetsForPath(level).length;
  const cmsArkuszCount = useMemo(
    () => groupCmsTasksByArkusz(cmsTasks).length,
    [cmsTasks],
  );

  const countValues: Record<BazaTab, string> = {
    zadania: String(taskCount),
    arkusze:
      cmsLoading ? "…" : cmsLoadState === "idle" ? "-" : String(cmsArkuszCount),
    trening: String(sheetCount),
  };

  const countLabels: Record<BazaTab, string> = {
    zadania: polishCount(taskCount, "zadanie", "zadania", "zadań"),
    arkusze:
      cmsLoading
        ? "Ładowanie liczby arkuszy"
        : cmsLoadState === "idle"
        ? "Otwórz, aby sprawdzić liczbę arkuszy"
        : polishCount(cmsArkuszCount, "arkusz", "arkusze", "arkuszy"),
    trening: polishCount(sheetCount, "arkusz", "arkusze", "arkuszy"),
  };

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  const setTab = (next: BazaTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "zadania") params.delete("tab");
    else params.set("tab", next);
    const q = params.toString();
    window.history.replaceState(
      null,
      "",
      q ? `/baza-zadan?${q}` : "/baza-zadan",
    );
  };

  return (
    <div className="page-container w-full py-8 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-overline">Baza zadań</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Wybierz punkt startu
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Wybierz temat, wpisz własną frazę albo przejdź do arkuszy. Ścieżka:{" "}
          <span className="font-semibold text-accent">{pathLabel}</span>{" "}
          <span className="text-muted/75">·</span>{" "}
          <span className="font-semibold text-foreground">
            {polishCount(taskCount, "zadanie", "zadania", "zadań")}
          </span>
        </p>

        <div
          className="mt-4 inline-flex rounded-lg border border-surface-border bg-surface p-1"
          role="tablist"
          aria-label="Poziom szkoły"
        >
          {(["sp", "srednia"] as const).map((schoolLevel) => {
            const active = level === schoolLevel;
            return (
              <button
                key={schoolLevel}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setLevelOverride(schoolLevel)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-accent text-on-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {learningPathLabel(schoolLevel)}
              </button>
            );
          })}
        </div>
      </header>

      <section
        className="mt-7 max-w-6xl border-y border-surface-border py-3"
        aria-labelledby="baza-zadan-goal-heading"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2
            id="baza-zadan-goal-heading"
            className="text-sm font-bold text-foreground"
          >
            Sposób pracy
          </h2>
          <p className="text-xs text-muted">
            Aktywne:{" "}
            <span className="font-semibold text-foreground">
              {activeTab.label}
            </span>
          </p>
        </div>

        <div
          className="mt-3 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Sposób pracy w bazie zadań"
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
                aria-label={`${label}, ${countLabels[id]}`}
                onClick={() => setTab(id)}
                className={`flex min-w-36 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition sm:min-w-0 ${
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-transparent text-muted hover:border-surface-border hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  aria-hidden="true"
                  className={`ml-auto min-w-6 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums ${
                    active
                      ? "bg-on-accent/15 text-on-accent"
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  {countValues[id]}
                </span>
              </button>
            );
          })}
        </div>

      </section>

      <div
        id="baza-zadan-panel"
        className="mt-7"
        role="tabpanel"
        aria-labelledby={`baza-tab-${tab}`}
      >
        {tab === "zadania" && (
          <BazaZadanTasksPanel key={level} level={level} />
        )}
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
        {tab === "trening" && <BazaZadanTreningPanel />}
      </div>
    </div>
  );
}
