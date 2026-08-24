import { compareArkuszSession } from "@/lib/baza-zadan/cke/sort-arkusze";
import type { ExamArchiveSheetMeta } from "@/lib/baza-zadan/exams/archive-types";

/** Ścieżka karty arkusza CKE — bez importu treści zadań. */
export function officialCkeSheetHref(sheetId: string): string {
  return `/trening/arkusze/${encodeURIComponent(sheetId)}`;
}

export function groupOfficialCkeSheetsByYear(
  sheets: ExamArchiveSheetMeta[],
): Array<{ year: number; sheets: ExamArchiveSheetMeta[] }> {
  const map = new Map<number, ExamArchiveSheetMeta[]>();
  for (const sheet of sheets) {
    const list = map.get(sheet.year) ?? [];
    list.push(sheet);
    map.set(sheet.year, list);
  }
  return [...map.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearSheets]) => ({
      year,
      sheets: [...yearSheets].sort((a, b) =>
        compareArkuszSession(
          { rok: a.year, miesiac: a.month },
          { rok: b.year, miesiac: b.month },
        ),
      ),
    }));
}
