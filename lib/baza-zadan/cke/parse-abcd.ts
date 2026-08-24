/**
 * Parsowanie treści CKE → prompt + opcje ABCD (lub zadanie otwarte).
 * Wydzielone z exportExamArchive, żeby dało się testować.
 */

export type ParsedAbcd = {
  prompt: string;
  choices: string[];
  hasChoices: boolean;
};

export type ResolvedCkeAnswer =
  | { status: "resolved"; correctIndex: number; letter: "A" | "B" | "C" | "D" }
  | { status: "ambiguous"; reason: string }
  | { status: "ungraded"; reason: string };

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
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
      hasChoices: false,
    };
  }

  const anchor = cleaned.search(/\sA\)\s/);
  if (anchor < 0) {
    return {
      prompt: cleaned,
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
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
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
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
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
      hasChoices: false,
    };
  }

  return { prompt, choices: choices.slice(0, 4), hasChoices: true };
}

/**
 * Rozwiązania w cache pochodzą z kilku pipeline'ów i nie mają osobnego pola
 * z kluczem. Oceniamy zadanie wyłącznie wtedy, gdy końcowa linia
 * „Odpowiedź:” zaczyna się od dokładnie jednej litery A–D.
 *
 * Sformułowania typu „zgodnie z kluczem”, „zazwyczaj C”, „B i E” są celowo
 * odrzucane — lepiej pokazać rozwiązanie bez punktu niż przyznać błędny punkt.
 */
export function resolveCkeAnswer(
  solution: string,
  parsedTask: Pick<ParsedAbcd, "hasChoices" | "choices">,
): ResolvedCkeAnswer {
  if (!parsedTask.hasChoices || parsedTask.choices.length < 2) {
    return { status: "ungraded", reason: "Zadanie otwarte lub wieloczęściowe" };
  }

  const normalized = solution.replace(/\*\*/g, "");
  const answerLines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^Odpowiedź\s*:/i.test(line));

  if (answerLines.length === 0) {
    return { status: "ambiguous", reason: "Brak jawnej linii „Odpowiedź:”" };
  }

  const answerText = answerLines.at(-1)!.replace(/^Odpowiedź\s*:\s*/i, "");
  const leading = answerText.match(/^([A-D])(?:\)|[.,:]|\s|$)/i);
  if (!leading) {
    return {
      status: "ambiguous",
      reason: "Linia odpowiedzi nie zaczyna się od pojedynczej litery A–D",
    };
  }

  const letter = leading[1].toUpperCase() as "A" | "B" | "C" | "D";
  const rest = answerText.slice(leading[0].length);
  if (/(?:^|[\s,(])(?:i|oraz|\/)\s*[A-D](?:[\s,).]|$)/i.test(rest)) {
    return { status: "ambiguous", reason: "Rozwiązanie wskazuje wiele opcji" };
  }

  const correctIndex = letter.charCodeAt(0) - 65;
  if (correctIndex >= parsedTask.choices.length) {
    return {
      status: "ambiguous",
      reason: `Opcja ${letter} nie występuje w sparsowanej treści`,
    };
  }

  return { status: "resolved", correctIndex, letter };
}
