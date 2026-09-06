import { checkAnswerMatch } from "@/lib/math/answer-equiv";

const ANSWER_LABEL_RE =
  /(?:^|\n)\s*(?:\*\*Odpowiedź:\*\*\s*)?([A-F])(?=\s|[),.:]|$)/i;
const ANY_CHOICE_LABEL_RE = /\b([A-F])(?=\s*[),.:])/gi;
const MULTI_CHOICE_RE = /\b[A-F]\s*(?:i|oraz|,|&)\s*[A-F]\b/i;

function choiceLabels(answer: string): string[] {
  return [...answer.matchAll(ANY_CHOICE_LABEL_RE)].map((match) =>
    match[1]!.toUpperCase(),
  );
}

function answerCandidates(answer: string): string[] {
  const trimmed = answer.trim();
  const candidates = [trimmed];

  for (const match of trimmed.matchAll(
    /(?:=|:)\s*(-?(?:\d+(?:[.,]\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(?:\s*(?:cm²|cm³|cm|m²|m|kg|g|°|°C|°F|zł|%))?)/giu,
  )) {
    candidates.push(match[1]!);
  }

  return [...new Set(candidates)];
}

/**
 * Wyprowadza indeks odpowiedzi z rozwiązania CKE.
 *
 * Zwraca null, gdy rozwiązanie jest wieloczęściowe, wielokrotnego wyboru albo
 * nie da się go bezpiecznie dopasować do opcji. Generator traktuje taki test
 * jako otwarty zamiast publikować fałszywy klucz A.
 */
export function inferCorrectChoiceIndex(
  answer: string | null | undefined,
  choices: readonly string[],
): number | null {
  if (choices.length < 2 || !answer?.trim()) return null;

  const labels = choiceLabels(answer);
  if (MULTI_CHOICE_RE.test(answer) || new Set(labels).size > 1) return null;

  const labeled = answer.match(ANSWER_LABEL_RE)?.[1]?.toUpperCase();
  if (labeled) {
    const index = labeled.charCodeAt(0) - "A".charCodeAt(0);
    if (index >= 0 && index < choices.length) return index;
  }

  const matches = new Set<number>();
  for (const candidate of answerCandidates(answer)) {
    choices.forEach((choice, index) => {
      if (checkAnswerMatch(candidate, choice)) matches.add(index);
    });
  }

  return matches.size === 1 ? [...matches][0]! : null;
}
