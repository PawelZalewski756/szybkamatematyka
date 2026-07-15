"use client";

import { SolutionDisplay } from "@/components/baza-zadan/SolutionDisplay";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { ProGate } from "@/components/subscription/ProGate";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import { isSolutionPlaceholder } from "@/lib/baza-zadan/solution-content";
import { canViewFullSolutions } from "@/lib/subscription/content-limits";
import { useSubscription } from "@/lib/subscription/use-subscription";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { AnimatePresence, motion } from "framer-motion";
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
  const { isPro } = useSubscription();
  const arkusz = zadanie.arkusz;
  const solutionPending = isSolutionPlaceholder(zadanie.rozwiazanie);
  const isArkuszView = context === "arkusz";

  if (!arkusz?.typ) {
    return null;
  }

  const typLabel = TYP_EGZAMINU_LABELS[arkusz.typ];
  const typStyle =
    arkusz.typ === "matura"
      ? "border-accent/40 bg-accent/15 text-accent"
      : "border-surface-border bg-surface-hover text-muted";

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
          onClick={() => setShowSolution((v) => !v)}
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
                {solutionPending ? (
                  <>
                    <p className="text-overline text-accent">
                      Wkrótce
                    </p>
                    <SolutionPendingNotice />
                  </>
                ) : canViewFullSolutions(isPro) ? (
                  <SolutionDisplay raw={zadanie.rozwiazanie} />
                ) : (
                  <ProGate featureLabel="Pełne rozwiązania arkuszy CKE">
                    <SolutionDisplay raw={zadanie.rozwiazanie} />
                  </ProGate>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
