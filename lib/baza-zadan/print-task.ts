import {
  examTaskPoints,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import type { Task } from "@/lib/baza-zadan/types";

/**
 * Zadanie arkusza w wersji do druku.
 *
 * Świadomie NIE zawiera `explanation`, `solutionSteps` ani `correctIndex` -
 * to treść planu Pro. Klucz jest pobierany osobno przez API dopiero po
 * potwierdzeniu subskrypcji. Ten typ jest jedynym, który wolno przekazać do
 * komponentu klienckiego `PrintArchiveSheet`.
 */
export type PrintTask = {
  id: string;
  number: string;
  points: number;
  prompt: string;
  choices: string[];
  open: boolean;
};

export function toPrintTask(task: Task, index: number): PrintTask {
  return {
    id: task.id,
    number: task.examSource?.taskNumber ?? String(index + 1),
    points: examTaskPoints(task),
    prompt: task.prompt,
    choices: [...task.choices],
    open: isOpenExamTask(task),
  };
}
