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
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Kompletne arkusze w aplikacji — rozwiązujesz zadania po kolei, na końcu
        widzisz wynik. Dla ścieżki{" "}
        <span className="font-semibold text-slate-300">{pathLabel}</span>.
      </p>

      {grouped.map(({ kind, label, sheets: items }) => (
        <section key={kind}>
          <h3 className="mb-3 text-sm font-bold text-white">{label}</h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
