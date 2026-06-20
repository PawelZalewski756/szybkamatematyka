/**
 * Banki twierdzeń prawda/fałsz — wspólne źródło dla minigier, wyzwań i testów jakości.
 */

export type ClaimTemplate = {
  correct: string;
  wrong: string;
};

export const PODSTAWOWA_CLAIMS: readonly ClaimTemplate[] = [
  { correct: "7 + 8 = 15", wrong: "7 + 8 = 16" },
  { correct: "9 + 6 = 15", wrong: "9 + 6 = 14" },
  { correct: "14 − 6 = 8", wrong: "14 − 6 = 9" },
  { correct: "20 − 7 = 13", wrong: "20 − 7 = 12" },
  { correct: "6 × 4 = 24", wrong: "6 × 4 = 28" },
  { correct: "7 × 3 = 21", wrong: "7 × 3 = 24" },
  { correct: "8 × 5 = 40", wrong: "8 × 5 = 45" },
  { correct: "18 ÷ 3 = 6", wrong: "18 ÷ 3 = 9" },
  { correct: "24 ÷ 4 = 6", wrong: "24 ÷ 4 = 8" },
  { correct: "5 + 6 > 10", wrong: "5 + 6 > 12" },
  { correct: "12 − 4 < 9", wrong: "12 − 4 < 7" },
  { correct: "3 × 3 = 9", wrong: "3 × 3 = 6" },
];

export const EGZAMIN_8_CLAIMS: readonly ClaimTemplate[] = [
  { correct: "½ + ½ = 1", wrong: "½ + ½ = 1/4" },
  { correct: "¼ + ¼ = ½", wrong: "¼ + ¼ = 1" },
  { correct: "⅗ + ⅖ = 1", wrong: "⅗ + ⅖ = 2/5" },
  { correct: "50% z 60 = 30", wrong: "50% z 60 = 35" },
  { correct: "25% z 80 = 20", wrong: "25% z 80 = 25" },
  { correct: "20% z 45 = 9", wrong: "20% z 45 = 12" },
  { correct: "2³ = 8", wrong: "2³ = 6" },
  { correct: "5² = 25", wrong: "5² = 10" },
  { correct: "2⁴ = 16", wrong: "2⁴ = 8" },
  { correct: "√16 = 4", wrong: "√16 = 8" },
  { correct: "√25 = 5", wrong: "√25 = 12" },
  { correct: "√9 + √4 = 5", wrong: "√9 + √4 = 3" },
];

export const MATURA_CLAIMS: readonly ClaimTemplate[] = [
  { correct: "log₂(8) = 3", wrong: "log₂(8) = 2" },
  { correct: "log₃(27) = 3", wrong: "log₃(27) = 9" },
  { correct: "log₁₀(100) = 2", wrong: "log₁₀(100) = 10" },
  { correct: "(a + b)² = a² + 2ab + b²", wrong: "(a + b)² = a² + b²" },
  { correct: "a² − b² = (a − b)(a + b)", wrong: "a² − b² = (a − b)²" },
  { correct: "(x + 1)(x − 1) = x² − 1", wrong: "(x + 1)(x − 1) = x² + 1" },
  { correct: "2³ × 2⁴ = 2⁷", wrong: "2³ × 2⁴ = 2¹²" },
  { correct: "(3²)³ = 3⁶", wrong: "(3²)³ = 3⁵" },
  { correct: "5⁶ ÷ 5² = 5⁴", wrong: "5⁶ ÷ 5² = 5³" },
  { correct: "f(x) = 2x, f(3) = 6", wrong: "f(x) = 2x, f(3) = 5" },
  { correct: "f(x) = x², f(4) = 16", wrong: "f(x) = x², f(4) = 8" },
  { correct: "x² · x³ = x⁵", wrong: "x² · x³ = x⁶" },
];

/** Twierdzenia symboliczne — weryfikacja ręczna (nie parsujemy CAS). */
export const SYMBOLIC_CORRECT_CLAIMS: readonly string[] = [
  "(a + b)² = a² + 2ab + b²",
  "a² − b² = (a − b)(a + b)",
  "(x + 1)(x − 1) = x² − 1",
];

export const SYMBOLIC_WRONG_CLAIMS: readonly string[] = [
  "(a + b)² = a² + b²",
  "a² − b² = (a − b)²",
  "(x + 1)(x − 1) = x² + 1",
];

export const ALL_NUMERIC_CLAIM_BANKS = [
  { name: "podstawowa", claims: PODSTAWOWA_CLAIMS },
  { name: "egzamin-8", claims: EGZAMIN_8_CLAIMS },
  { name: "matura-numeric", claims: MATURA_CLAIMS.filter((c) => !/[a-z]/.test(c.correct)) },
] as const;
