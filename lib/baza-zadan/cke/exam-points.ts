import { OPEN_TASK_PLACEHOLDER } from "@/lib/baza-zadan/cke/parse-abcd";
import type { Task } from "@/lib/baza-zadan/types";

const FULL_CREDIT_RE =
  /(\d+)\s*pkt\s*[–-]\s*(odpowiedź poprawna|rozwiązanie poprawne|obie odpowiedzi|wybranie dwóch)/i;
const ANY_PKT_RE = /(\d+)\s*pkt\b/gi;

export function isOpenExamTask(task: Pick<Task, "choices">): boolean {
  if (task.choices.length <= 1) return true;
  return task.choices.some(
    (choice) =>
      choice === OPEN_TASK_PLACEHOLDER || /zadanie otwarte/i.test(choice),
  );
}

export function formatPkt(points: number): string {
  return `${points} pkt`;
}

/** Klucz oczekiwanej odpowiedzi do porównania / oceny AI. */
export function expectedOpenAnswer(task: Task): string {
  const explanation = task.explanation.trim();
  if (explanation && !/zadanie otwarte/i.test(explanation)) {
    return explanation;
  }
  const lastStep = task.solutionSteps?.at(-1)?.trim();
  if (lastStep) return lastStep;
  return explanation;
}

function parsePointsFromMarking(text: string): number | null {
  const full = text.match(FULL_CREDIT_RE);
  if (full) {
    const value = Number(full[1]);
    if (value >= 1 && value <= 6) return value;
  }

  const found: number[] = [];
  for (const match of text.matchAll(ANY_PKT_RE)) {
    const value = Number(match[1]);
    if (value >= 1 && value <= 6) found.push(value);
  }
  if (found.length === 0) return null;
  return Math.max(...found);
}

function inferCkePoints(task: Task, open: boolean): number {
  if (!open) return 1;

  const year = task.examSource?.year ?? 0;
  const numer = Number.parseInt(task.examSource?.taskNumber ?? "", 10) || 0;
  const wykaż = /wykaż/i.test(task.prompt);

  if (year >= 2023) {
    if (wykaż) return 2;
    if (numer >= 31) return 3;
    return 2;
  }

  if (wykaż) return 4;
  if (numer >= 32) return 5;
  if (numer >= 29) return 4;
  if (numer >= 25) return 3;
  return 2;
}

/** Punktacja CKE: klucz z rozwiązania, inaczej typowa formula arkusza. */
export function examTaskPoints(task: Task): number {
  const open = isOpenExamTask(task);
  if (!open) return 1;
  const blob = [task.prompt, task.explanation, ...(task.solutionSteps ?? [])].join(
    "\n",
  );
  const parsed = parsePointsFromMarking(blob);
  if (parsed != null) return parsed;
  return inferCkePoints(task, open);
}

export function examSheetPoints(tasks: readonly Task[]): number {
  return tasks.reduce((sum, task) => sum + examTaskPoints(task), 0);
}
