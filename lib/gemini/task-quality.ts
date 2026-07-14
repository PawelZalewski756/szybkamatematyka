import { checkAnswerMatch, answersEquivalent } from "@/lib/math/answer-equiv";
import type { ParsedGeminiTask } from "@/lib/gemini/format-tasks";
import { isOpenTask } from "@/lib/gemini/format-tasks";

const CORRECTION_PATTERNS = [
  /Poprawiam poprawn[aą] odpowied[źz]\s*(?:na\s*)?[:：]?\s*([^.\n]+)/i,
  /Poprawiona odpowied[źz]\s*(?:to\s*)?[:：]?\s*([^.\n]+)/i,
  /Poprawna odpowied[źz]\s*(?:to\s*)?[:：]?\s*([^.\n]+)/i,
  /Prawidłowa odpowied[źz]\s*(?:to\s*)?[:：]?\s*([^.\n]+)/i,
  /\*\*Odpowied[źz]:\*\*\s*([^.\n]+)/i,
  /opcja\s+([A-D])\s+jest\s+poprawna/i,
];

export const BROKEN_EXPLANATION_MARKERS = [
  /błąd w zadaniu/i,
  /błąd w opcjach/i,
  /błąd w moim/i,
  /żadna z opcji/i,
  /nie pasuje do opcji/i,
  /Jest problem z opcjami/i,
  /Wynik \d+ nie jest wśród opcji/i,
];

function cleanInferredAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/\*+/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^\$+|\$+$/g, "")
    .trim();
}

function isPlausibleAnswer(ans: string): boolean {
  const a = ans.trim();
  if (!a || a.length > 80) return false;
  // odrzuć zdania-prozę zamiast odpowiedzi
  if (a.length > 28 && /\s+(przez|powinna|uczeń|formie|np\.|czyli)\s/i.test(a)) {
    return false;
  }
  return true;
}

/** Wyciąga końcowy wynik liczbowy z ostatniego łańcucha „= …” w tekście. */
function lastNumericEquals(text: string): string | null {
  const matches = [
    ...text.matchAll(/=\s*(-?\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(?:[.,)\]\s}{]|$)/g),
  ];
  if (matches.length === 0) return null;
  return matches[matches.length - 1]![1]!.replace(",", ".");
}

/**
 * Próbuje odczytać poprawną odpowiedź z explanation (Gemini często myli correct_answer).
 */
export function inferAnswerFromExplanation(explanation: string): string | null {
  if (!explanation.trim()) return null;

  for (const re of CORRECTION_PATTERNS) {
    const m = explanation.match(re);
    if (m?.[1]) {
      const ans = cleanInferredAnswer(m[1]);
      if (isPlausibleAnswer(ans)) {
        if (/^[A-D]$/i.test(ans)) return ans.toUpperCase();
        return ans;
      }
    }
  }

  const plain = explanation.replace(/\$\$/g, "").replace(/\$/g, "");
  const segments = plain.split(/\b(Zatem|Wynik|wynos[ií]|Ostatecznie)\b/i);
  const tail = segments[segments.length - 1] ?? plain;
  const numeric = lastNumericEquals(tail);
  if (numeric !== null) return numeric;

  return lastNumericEquals(plain);
}

export type TaskRepairResult = ParsedGeminiTask & {
  repaired?: boolean;
  shouldRemove?: boolean;
  repairReason?: string;
};

/** Naprawia correct_answer lub oznacza zadanie do usunięcia. */
export function reconcileTaskAnswer(task: ParsedGeminiTask): TaskRepairResult {
  const inferred = inferAnswerFromExplanation(task.explanation);
  const broken = BROKEN_EXPLANATION_MARKERS.some((re) => re.test(task.explanation));

  if (isOpenTask(task)) {
    if (
      inferred &&
      !checkAnswerMatch(inferred, task.correct_answer) &&
      !broken
    ) {
      return {
        ...task,
        correct_answer: inferred,
        repaired: true,
        repairReason: `open: ${task.correct_answer} → ${inferred}`,
      };
    }
    if (broken && inferred && !checkAnswerMatch(inferred, task.correct_answer)) {
      return {
        ...task,
        correct_answer: inferred,
        repaired: true,
        repairReason: `open (broken expl): → ${inferred}`,
      };
    }
    return task;
  }

  const hasCorrect = task.options.some((o) =>
    checkAnswerMatch(o, task.correct_answer),
  );
  if (hasCorrect) return task;

  if (inferred) {
    const letter = inferred.match(/^([A-D])$/i)?.[1]?.toUpperCase();
    if (letter) {
      const idx = letter.charCodeAt(0) - 65;
      const opt = task.options[idx];
      if (opt) {
        return {
          ...task,
          correct_answer: opt,
          repaired: true,
          repairReason: `mc letter ${letter}`,
        };
      }
    }

    const byValue = task.options.find((o) => checkAnswerMatch(o, inferred));
    if (byValue) {
      return {
        ...task,
        correct_answer: byValue,
        repaired: true,
        repairReason: `mc inferred: ${inferred}`,
      };
    }

    const byEquiv = task.options.find((o) => answersEquivalent(o, inferred));
    if (byEquiv) {
      return {
        ...task,
        correct_answer: byEquiv,
        repaired: true,
        repairReason: `mc equiv: ${inferred}`,
      };
    }
  }

  if (broken) {
    return { ...task, shouldRemove: true, repairReason: "broken explanation" };
  }

  return task;
}

export function auditTaskQuality(task: ParsedGeminiTask): string[] {
  const issues: string[] = [];

  if (isOpenTask(task)) {
    const inferred = inferAnswerFromExplanation(task.explanation);
    if (
      inferred &&
      !checkAnswerMatch(inferred, task.correct_answer)
    ) {
      issues.push(
        `open mismatch: correct="${task.correct_answer}" vs explanation→"${inferred}"`,
      );
    }
  } else {
    if (
      !task.options.some((o) => checkAnswerMatch(o, task.correct_answer))
    ) {
      issues.push(`mc: correct_answer not in options`);
    }
  }

  if (BROKEN_EXPLANATION_MARKERS.some((re) => re.test(task.explanation))) {
    issues.push("broken explanation marker");
  }

  return issues;
}
