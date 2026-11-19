import type { Task, TaskDifficulty } from "@/lib/baza-zadan/types";

const DIFFICULTY_RANK: Record<TaskDifficulty, number> = {
  latwy: 0,
  sredni: 1,
  trudny: 2,
};

function hashId(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Kolejność zadań w temacie: od łatwych do trudnych, a w obrębie poziomu
 * alfabetycznie. Bez tego lista szła w kolejności z pliku danych i wyglądała
 * losowo.
 *
 * Wyjątek: zadania proceduralne (`proc-*`) mają alfabetycznie identyczny
 * początek („Ile to 5% z 40?”, „Ile to 5% z 60?”...), więc sortowanie po
 * tytule pokazywało dziewięć wariantów tego samego przykładu. Dla nich
 * kolejność jest deterministycznie mieszana po ID - lista jest różnorodna,
 * ale stabilna między odświeżeniami.
 */
export function sortTasksForDisplay<
  T extends Pick<Task, "difficulty" | "title" | "id">,
>(tasks: readonly T[]): T[] {
  return [...tasks].sort((a, b) => {
    const byDifficulty =
      DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
    if (byDifficulty !== 0) return byDifficulty;

    const aProc = a.id.startsWith("proc-");
    const bProc = b.id.startsWith("proc-");
    if (aProc !== bProc) return aProc ? 1 : -1;
    if (aProc && bProc) return hashId(a.id) - hashId(b.id);

    return a.title.localeCompare(b.title, "pl", { numeric: true });
  });
}

export type OrderedChoices = {
  choices: string[];
  correctIndex: number;
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mały deterministyczny generator - ten sam taskId daje tę samą kolejność. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Miesza opcje odpowiedzi deterministycznie po ID zadania i pilnuje, żeby
 * poprawna odpowiedź dalej wskazywała tę samą treść. Dzięki temu po
 * odświeżeniu strony kolejność się nie zmienia, a w całym temacie nie da się
 * zgadnąć odpowiedzi po pozycji.
 */
export function orderChoices(
  taskId: string,
  choices: readonly string[],
  correctIndex: number,
): OrderedChoices {
  if (choices.length < 2 || correctIndex < 0 || correctIndex >= choices.length) {
    return { choices: [...choices], correctIndex };
  }

  const random = mulberry32(hashSeed(taskId));
  const order = choices.map((_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith]!, order[index]!];
  }

  return {
    choices: order.map((index) => choices[index]!),
    correctIndex: order.indexOf(correctIndex),
  };
}

/**
 * Zwraca zadanie z przemieszanymi opcjami. Zadania CKE zostawiamy w kolejności
 * z arkusza, bo odpowiadają im litery A-D w materiałach źródłowych.
 */
export function orderTaskChoices(task: Task): Task {
  if (task.examSource) return task;

  const { choices, correctIndex } = orderChoices(
    task.id,
    task.choices,
    task.correctIndex,
  );

  if (
    correctIndex === task.correctIndex &&
    choices.every((choice, index) => choice === task.choices[index])
  ) {
    return task;
  }

  return { ...task, choices, correctIndex };
}
