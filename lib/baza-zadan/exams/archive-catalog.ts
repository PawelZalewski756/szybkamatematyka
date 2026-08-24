/**
 * Katalog arkuszy CKE po stronie serwera.
 *
 * Importuje pełne archiwum zadań (~1.5 MB). Nie wolno go importować z Client
 * Componentów — użyj `archive-sheet-meta.ts` do linków i grupowania.
 */
import { compareArkuszSession } from "@/lib/baza-zadan/cke/sort-arkusze";
import type { ExamArchiveSheetMeta } from "@/lib/baza-zadan/exams/archive-types";
import {
  EXAM_ARCHIVE_SHEETS,
  EXAM_ARCHIVE_TASKS,
} from "@/lib/baza-zadan/exams/cke-archive.generated";
import type { Task } from "@/lib/baza-zadan/types";

export {
  groupOfficialCkeSheetsByYear,
  officialCkeSheetHref,
} from "@/lib/baza-zadan/exams/archive-sheet-meta";

let taskById: Map<string, Task> | null = null;

function archiveTaskMap(): Map<string, Task> {
  if (!taskById) {
    taskById = new Map(EXAM_ARCHIVE_TASKS.map((task) => [task.id, task]));
  }
  return taskById;
}

/** Oficjalne sesje CKE z archiwum kodowego — bez Supabase. */
export function listOfficialCkeSheets(): ExamArchiveSheetMeta[] {
  return [...EXAM_ARCHIVE_SHEETS].sort((a, b) =>
    compareArkuszSession(
      { rok: a.year, miesiac: a.month },
      { rok: b.year, miesiac: b.month },
    ),
  );
}

export function getOfficialCkeSheetById(
  id: string,
): ExamArchiveSheetMeta | undefined {
  return EXAM_ARCHIVE_SHEETS.find((sheet) => sheet.id === id);
}

export function getOfficialCkeSheetTasks(sheetId: string): Task[] {
  const sheet = getOfficialCkeSheetById(sheetId);
  if (!sheet) return [];
  const tasks = archiveTaskMap();
  return sheet.taskIds
    .map((taskId) => tasks.get(taskId))
    .filter((task): task is Task => Boolean(task));
}
