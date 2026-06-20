import type { Task } from "@/lib/baza-zadan/types";

/** Treść zadania do bazy Supabase (z opcjami ABCD, jeśli są). */
export function formatTaskTrescForDb(task: Task): string {
  const lines = [`${task.title}`, "", task.prompt.trim()];

  if (task.choices.length > 0) {
    lines.push("", "Odpowiedzi:");
    task.choices.forEach((c, i) => {
      lines.push(`${String.fromCharCode(65 + i)}. ${c}`);
    });
  }

  return lines.join("\n").trim();
}

/** Gotowe rozwiązanie z katalogu (bez Gemini) — spójne z poprawną odpowiedzią. */
export function buildRozwiazanieFromCatalog(task: Task): string | null {
  const steps: string[] = [];

  if (task.solutionSteps?.length) {
    task.solutionSteps.forEach((s, i) => {
      steps.push(`Krok ${i + 1}: ${s}`);
    });
  } else if (task.explanation?.trim()) {
    steps.push(`Krok 1: ${task.explanation.trim()}`);
  } else {
    return null;
  }

  if (task.choices.length > 0) {
    const correct = task.choices[task.correctIndex];
    const letter = String.fromCharCode(65 + task.correctIndex);
    steps.push(
      "",
      `Odpowiedź: ${correct} (opcja ${letter})`,
    );
  }

  return steps.join("\n").trim();
}

export function getCorrectAnswerMeta(task: Task): {
  poprawnaOdpowiedz: string | null;
  numerOpcji: number | null;
  literaOpcji: string | null;
} {
  if (task.choices.length === 0) {
    return { poprawnaOdpowiedz: null, numerOpcji: null, literaOpcji: null };
  }
  const idx = task.correctIndex;
  return {
    poprawnaOdpowiedz: task.choices[idx] ?? null,
    numerOpcji: idx + 1,
    literaOpcji: String.fromCharCode(65 + idx),
  };
}
