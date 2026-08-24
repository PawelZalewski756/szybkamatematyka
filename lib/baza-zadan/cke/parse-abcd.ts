/**
 * Parsowanie treści CKE → prompt + opcje ABCD (lub zadanie otwarte).
 * Wydzielone z exportExamArchive, żeby dało się testować.
 */

export type ParsedAbcd = {
  prompt: string;
  choices: string[];
  hasChoices: boolean;
};

export const OPEN_TASK_PLACEHOLDER = "Zadanie otwarte — patrz rozwiązanie";

/** Usuwa śmieci HTML z parsera CKE. */
export function cleanCkeTaskMarkup(tresc: string): string {
  return tresc
    .replace(/<ul\s+class=["'][^"']*["'][^>]*>/gi, "")
    .replace(/<\/?ul[^>]*>/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Zadania „Oceń prawdziwość” mają wiele par A) prawda / B) fałsz.
 * Nie mieszczą się w jednym MC z `correctIndex` — traktujemy jako otwarte
 * (pełna treść + rozwiązanie krok po kroku).
 */
export function isMultiClaimTrueFalse(tresc: string): boolean {
  if (/Oceń prawdziwość/i.test(tresc)) return true;
  const prawdaLabels = tresc.match(/\bA\)\s*prawda\b/gi) ?? [];
  return prawdaLabels.length >= 2;
}

export function parseAbcd(tresc: string): ParsedAbcd {
  const cleaned = cleanCkeTaskMarkup(tresc);

  if (isMultiClaimTrueFalse(cleaned)) {
    return {
      prompt: cleaned,
      choices: [OPEN_TASK_PLACEHOLDER],
      hasChoices: false,
    };
  }

  const anchor = cleaned.search(/\sA\)\s/);
  if (anchor < 0) {
    return {
      prompt: cleaned,
      choices: [OPEN_TASK_PLACEHOLDER],
      hasChoices: false,
    };
  }

  const prompt = cleaned.slice(0, anchor).trim();
  const optsText = cleaned.slice(anchor).trim();
  const parts = optsText.split(/\s(?=[A-D]\)\s)/).filter(Boolean);
  const choices = parts
    .map((p) => p.replace(/^[A-D]\)\s*/, "").trim())
    .filter(Boolean);

  if (choices.length < 2) {
    return {
      prompt: cleaned,
      choices: [OPEN_TASK_PLACEHOLDER],
      hasChoices: false,
    };
  }

  // Jeśli parser i tak wyciął zduplikowane same etykiety P/F — otwarte.
  const normalized = choices.map((c) => c.trim().toLowerCase());
  const onlyPfLabels = normalized.every(
    (c) => c === "prawda" || c === "fałsz" || c.startsWith("prawda ") || c.startsWith("fałsz "),
  );
  const hasDupPf =
    normalized.filter((c) => c === "prawda").length > 1 ||
    normalized.filter((c) => c === "fałsz").length > 1;
  if (onlyPfLabels && hasDupPf) {
    return {
      prompt: cleaned,
      choices: [OPEN_TASK_PLACEHOLDER],
      hasChoices: false,
    };
  }

  return { prompt, choices: choices.slice(0, 4), hasChoices: true };
}
