import type { Task } from "@/lib/baza-zadan/types";
import {
  EXAM_ARCHIVE_TASKS as RAW_ARCHIVE_TASKS,
  EXAM_ARCHIVE_SHEETS,
} from "@/lib/baza-zadan/exams/cke-archive.generated";

/**
 * Zadania z egzaminu ósmoklasisty miały forPaths ustawione na
 * liceum/technikum. To sprawiało, że w trybie "szkoła średnia" pojawiały się
 * tematy "Egzamin ósmoklasisty - ...". Normalizujemy ścieżki przy imporcie,
 * żeby E8 było widoczne tylko w szkole podstawowej.
 */
const E8_PATHS = ["sp", "egzamin-8"] as const;

export const EXAM_ARCHIVE_TASKS: Task[] = RAW_ARCHIVE_TASKS.map((task) =>
  task.examSource?.kind === "egzamin-8"
    ? { ...task, forPaths: E8_PATHS }
    : task,
);

export { EXAM_ARCHIVE_SHEETS };
