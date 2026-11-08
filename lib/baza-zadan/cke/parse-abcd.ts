/**
 * Parsowanie treści CKE → prompt + opcje ABCD (lub zadanie otwarte).
 * Wydzielone z exportExamArchive, żeby dało się testować.
 */

export type ParsedAbcd = {
  prompt: string;
  choices: string[];
  hasChoices: boolean;
};

export const OPEN_TASK_PLACEHOLDER = "Zadanie otwarte - patrz rozwiązanie";

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&fnof;": "f",
  "&frasl;": "/",
  "&lang;": "⟨",
  "&rang;": "⟩",
  "&raquo;": "»",
  "&laquo;": "«",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&delta;": "δ",
  "&pi;": "π",
  "&ge;": "≥",
  "&le;": "≤",
  "&ne;": "≠",
  "&radic;": "√",
  "&#8738;": "∠",
  "&#8730;": "√",
  "&#8731;": "∛",
};

/** Dekoduje encje HTML typowe dla arkuszy CKE. */
export function decodeCkeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (match, code) => {
      const known = HTML_ENTITIES[match.toLowerCase()];
      if (known) return known;
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    })
    .replace(/&[a-zA-Z]+;/g, (match) => HTML_ENTITIES[match.toLowerCase()] ?? match);
}

/**
 * Usuwa śmieci HTML z parsera CKE.
 * Łapie też urwany tag typu `<ul class="` (bez zamykającego `>`),
 * który wcześniej przechodził do UI jako widoczny tekst.
 */
export function cleanCkeTaskMarkup(tresc: string): string {
  return decodeCkeHtmlEntities(tresc)
    .replace(/<\/?ul\b[^>]*>/gi, "")
    // Urwany tag bez `>` (np. `<ul class="` na końcu treści).
    .replace(/<[a-zA-Z][^<>]*$/gm, "")
    // Pozostałe kompletne tagi (nie rusza nierówności `0 < x`).
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Zadania „Oceń prawdziwość” mają wiele par A) prawda / B) fałsz.
 * Nie mieszczą się w jednym MC z `correctIndex` - traktujemy jako otwarte
 * (pełna treść + rozwiązanie krok po kroku).
 */
export function isMultiClaimTrueFalse(tresc: string): boolean {
  if (/Oceń prawdziwość/i.test(tresc)) return true;
  const prawdaLabels = tresc.match(/\bA\)\s*prawda\b/gi) ?? [];
  return prawdaLabels.length >= 2;
}

function isCompositeOrExtendedChoiceTask(tresc: string): boolean {
  return (
    /(?:^|\s)[EF]\)\s/i.test(tresc) ||
    /\bZadanie\s+\d+\.\d+\b/i.test(tresc) ||
    /\bwybierz\s+(?:dwie|dwa|więcej niż jedną)\b/i.test(tresc)
  );
}

export function parseAbcd(tresc: string): ParsedAbcd {
  const cleaned = cleanCkeTaskMarkup(tresc);

  if (
    isMultiClaimTrueFalse(cleaned) ||
    isCompositeOrExtendedChoiceTask(cleaned)
  ) {
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

  // Jeśli parser i tak wyciął zduplikowane same etykiety P/F - otwarte.
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
