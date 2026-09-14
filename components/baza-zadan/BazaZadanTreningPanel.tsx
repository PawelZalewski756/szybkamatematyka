"use client";

import { ExamSheetCard } from "@/components/baza-zadan/ExamSheetCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useLearningPath } from "@/components/LearningPathProvider";
import { getExamSheetsForPath } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEET_KIND_LABELS } from "@/lib/baza-zadan/sections";
import type { ExamSheetKind } from "@/lib/baza-zadan/types";
import { learningPathLabel } from "@/lib/learning-path";
import { ClipboardList } from "lucide-react";
import { useMemo } from "react";

const KIND_ORDER: ExamSheetKind[] = ["trening", "egzamin-8", "matura"];

export function BazaZadanTreningPanel() {
  const { path } = useLearningPath();
  const sheets = useMemo(() => getExamSheetsForPath(path), [path]);
  const pathLabel = learningPathLabel(path);

  const grouped = useMemo(() => {
    const map = new Map<ExamSheetKind, typeof sheets>();
    for (const sheet of sheets) {
      const list = map.get(sheet.kind) ?? [];
      list.push(sheet);
      map.set(sheet.kind, list);
    }
    return KIND_ORDER.filter((k) => map.has(k)).map((kind) => ({
      kind,
      label: EXAM_SHEET_KIND_LABELS[kind],
      sheets: map.get(kind)!,
    }));
  }, [sheets]);

  if (sheets.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Brak arkuszy treningowych"
        description={`Dla ścieżki „${pathLabel}” nie ma jeszcze arkuszy. Zmień ścieżkę w pasku u góry.`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-2xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-overline">Symulacje</p>
          <p className="mt-1 text-sm text-muted">
            Kompletne arkusze z wynikiem na końcu:{" "}
            <span className="font-semibold text-foreground">
              {sheets.length}
            </span>
            .
          </p>
        </div>
        <p className="text-sm text-muted">
          Ścieżka:{" "}
          <span className="font-semibold text-foreground">{pathLabel}</span>
        </p>
      </div>

      {grouped.map(({ kind, label, sheets: items }) => (
        <section key={kind} aria-labelledby={`trening-group-${kind}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2
              id={`trening-group-${kind}`}
              className="text-base font-bold text-foreground"
            >
              {label}
            </h2>
            <span className="text-sm tabular-nums text-muted">
              {items.length}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((sheet) => (
              <li key={sheet.id}>
                <ExamSheetCard sheet={sheet} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
