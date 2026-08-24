"use client";

import { BazaZadanTasksPanel } from "@/components/baza-zadan/BazaZadanTasksPanel";
import { BazaZadanTreningPanel } from "@/components/baza-zadan/BazaZadanTreningPanel";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getClientExamSheetsForPath,
  getClientTaskStats,
} from "@/lib/baza-zadan/client-catalog";
import { learningPathLabel } from "@/lib/learning-path";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export type BazaTab = "zadania" | "trening";

const TABS: { id: BazaTab; label: string; hint: string }[] = [
  {
    id: "zadania",
    label: "Ćwicz zadania",
    hint: "Pojedyncze zadania treningowe — filtruj po dziale i trudności.",
  },
  {
    id: "trening",
    label: "Symulacje",
    hint: "Krótkie arkusze treningowe w aplikacji (E8 / matura MIX).",
  },
];

function parseTab(value: string | null): BazaTab {
  if (value === "trening") return value;
  return "zadania";
}

export function BazaZadanView() {
  const { path } = useLearningPath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const pathLabel = learningPathLabel(path);
  const taskCount = getClientTaskStats(path).totalTasks;
  const sheetCount = getClientExamSheetsForPath(path).length;

  const counts: Record<BazaTab, number> = {
    zadania: taskCount,
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

      <Link
        href="/trening/arkusze"
        className="mt-6 inline-flex items-center rounded-lg border border-accent/30 bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/15"
      >
        Oficjalne arkusze CKE →
      </Link>

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
              id={`baza-tab-${id}`}
              aria-controls="baza-tabpanel"
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

      <div
        id="baza-tabpanel"
        className="mt-6"
        role="tabpanel"
        aria-labelledby={`baza-tab-${tab}`}
      >
        {tab === "zadania" && <BazaZadanTasksPanel />}
        {tab === "trening" && <BazaZadanTreningPanel />}
      </div>
    </div>
  );
}
