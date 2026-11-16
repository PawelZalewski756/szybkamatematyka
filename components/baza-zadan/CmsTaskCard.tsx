"use client";

import { SolutionDisplay } from "@/components/baza-zadan/SolutionDisplay";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { ProGate } from "@/components/subscription/ProGate";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import { isSolutionPlaceholder } from "@/lib/baza-zadan/solution-content";
import { useSubscription } from "@/lib/subscription/use-subscription";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { fetchCmsSolution } from "@/lib/trening/task-assist-client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type CmsTaskCardProps = {
  zadanie: ZadanieWithArkusz;
  /** catalog = pełne metadane; arkusz = widok pojedynczego arkusza */
  context?: "catalog" | "arkusz";
};

function SolutionPendingNotice() {
  return (
    <p className="mt-2 text-sm leading-relaxed text-muted">
      Rozwiązanie jest uzupełniane w bazie. Sprawdź ponownie wkrótce.
    </p>
  );
}

export function CmsTaskCard({ zadanie, context = "catalog" }: CmsTaskCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const { isPro } = useSubscription();
  const arkusz = zadanie.arkusz;
  const isArkuszView = context === "arkusz";

  if (!arkusz?.typ) {
    return null;
  }

  const typLabel = TYP_EGZAMINU_LABELS[arkusz.typ];
  const typStyle =
    arkusz.typ === "matura"
      ? "border-accent/40 bg-accent/15 text-accent"
      : "border-surface-border bg-surface-hover text-muted";

  async function loadSolution() {
    if (!isPro || solution !== null || solutionLoading) return;
    setSolutionLoading(true);
    setSolutionError(null);
    try {
      setSolution(await fetchCmsSolution(zadanie.id));
    } catch (error) {
      setSolutionError(
        error instanceof Error ? error.message : "Nie udało się pobrać rozwiązania.",
      );
    } finally {
      setSolutionLoading(false);
    }
  }

  function toggleSolution() {
    const next = !showSolution;
    setShowSolution(next);
    if (next && isPro) void loadSolution();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-surface-border bg-surface"
    >
      <div className="border-b border-surface-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-accent px-2.5 py-1 text-sm font-black text-on-accent">
            Zad. {zadanie.numer_zadania}
          </span>
          {!isArkuszView ? (
            <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${typStyle}`}>
              {typLabel}
            </span>
          ) : null}
          <span className="rounded-lg border border-surface-border bg-surface-hover px-2 py-0.5 text-xs font-semibold text-muted">
            {zadanie.dzial}
          </span>
        </div>
        {!isArkuszView ? (
          <p className="mt-1.5 text-sm text-muted">{formatArkuszLabel(arkusz)}</p>
        ) : null}
      </div>

      <div className="px-4 py-4 sm:px-5">
        <TaskTresc tresc={zadanie.tresc} />

        <button
          type="button"
          onClick={toggleSolution}
          className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
            showSolution
              ? "border border-surface-border bg-surface-hover text-muted"
              : "border border-success/30 bg-success/10 text-success hover:bg-success/15"
          }`}
        >
          {showSolution ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}
        </button>

        <AnimatePresence initial={false}>
          {showSolution && (
            <motion.div
              key="solution"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-l-2 border-success/40 pl-4">
                {!isPro ? (
                  <ProGate featureLabel="Pełne rozwiązania arkuszy CKE">
                    {null}
                  </ProGate>
                ) : solutionLoading ? (
                  <p className="flex items-center gap-2 text-sm text-muted" role="status">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Ładowanie rozwiązania…
                  </p>
                ) : solutionError ? (
                  <p className="text-sm text-danger">
                    {solutionError}{" "}
                    <button
                      type="button"
                      onClick={() => void loadSolution()}
                      className="font-bold underline"
                    >
                      Spróbuj ponownie
                    </button>
                  </p>
                ) : solution === null ? (
                  <button
                    type="button"
                    onClick={() => void loadSolution()}
                    className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-bold text-accent transition hover:bg-accent/15"
                  >
                    Pobierz rozwiązanie
                  </button>
                ) : isSolutionPlaceholder(solution) ? (
                  <>
                    <p className="text-overline text-accent">Wkrótce</p>
                    <SolutionPendingNotice />
                  </>
                ) : (
                  <SolutionDisplay raw={solution} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
