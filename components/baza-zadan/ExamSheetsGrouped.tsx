"use client";

import { ExamSheetCard } from "@/components/baza-zadan/ExamSheetCard";
import type { ExamSheetGroup } from "@/lib/baza-zadan/catalog";
import { useState } from "react";

type ExamSheetsGroupedProps = {
  groups: ExamSheetGroup[];
  /** Domyślnie rozwinięte grupy (np. tylko trening). */
  defaultOpenKinds?: Set<ExamSheetGroup["kind"]>;
};

export function ExamSheetsGrouped({
  groups,
  defaultOpenKinds = new Set(["trening"]),
}: ExamSheetsGroupedProps) {
  const [openKinds, setOpenKinds] = useState<Set<ExamSheetGroup["kind"]>>(
    () => new Set(defaultOpenKinds),
  );

  const toggle = (kind: ExamSheetGroup["kind"]) => {
    setOpenKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = openKinds.has(group.kind);
        return (
          <div
            key={group.kind}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40"
          >
            <button
              type="button"
              onClick={() => toggle(group.kind)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div>
                <h3 className="text-base font-black text-white">{group.label}</h3>
                <p className="text-sm text-zinc-500">
                  {group.sheets.length}{" "}
                  {group.sheets.length === 1 ? "arkusz" : "arkusze"}
                </p>
              </div>
              <span
                className={`shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 gap-4 border-t border-white/5 px-4 pb-4 pt-2 md:grid-cols-2">
                {group.sheets.map((sheet) => (
                  <ExamSheetCard key={sheet.id} sheet={sheet} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
