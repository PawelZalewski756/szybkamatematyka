/**
 * Banki twierdzeń prawda/fałsz - wspólne źródło dla minigier, wyzwań i testów jakości.
 * Wszystkie równania w LaTeXu (KaTeX): inline `$...$`.
 */

import { latexClaimToPlain } from "@/lib/math/answer-equiv";

export type ClaimTemplate = {
  correct: string;
  wrong: string;
};

export const PODSTAWOWA_CLAIMS: readonly ClaimTemplate[] = [
  { correct: "$7 + 8 = 15$", wrong: "$7 + 8 = 16$" },
  { correct: "$9 + 6 = 15$", wrong: "$9 + 6 = 14$" },
  { correct: "$14 - 6 = 8$", wrong: "$14 - 6 = 9$" },
  { correct: "$20 - 7 = 13$", wrong: "$20 - 7 = 12$" },
  { correct: "$6 \\times 4 = 24$", wrong: "$6 \\times 4 = 28$" },
  { correct: "$7 \\times 3 = 21$", wrong: "$7 \\times 3 = 24$" },
  { correct: "$8 \\times 5 = 40$", wrong: "$8 \\times 5 = 45$" },
  { correct: "$18 \\div 3 = 6$", wrong: "$18 \\div 3 = 9$" },
  { correct: "$24 \\div 4 = 6$", wrong: "$24 \\div 4 = 8$" },
  { correct: "$5 + 6 > 10$", wrong: "$5 + 6 > 12$" },
  { correct: "$12 - 4 < 9$", wrong: "$12 - 4 < 7$" },
  { correct: "$3 \\times 3 = 9$", wrong: "$3 \\times 3 = 6$" },
];

export const EGZAMIN_8_CLAIMS: readonly ClaimTemplate[] = [
  {
    correct: "$\\frac{1}{2} + \\frac{1}{2} = 1$",
    wrong: "$\\frac{1}{2} + \\frac{1}{2} = \\frac{1}{4}$",
  },
  {
    correct: "$\\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$",
    wrong: "$\\frac{1}{4} + \\frac{1}{4} = 1$",
  },
  {
    correct: "$\\frac{3}{5} + \\frac{2}{5} = 1$",
    wrong: "$\\frac{3}{5} + \\frac{2}{5} = \\frac{2}{5}$",
  },
  { correct: "$50\\%$ z $60 = 30$", wrong: "$50\\%$ z $60 = 35$" },
  { correct: "$25\\%$ z $80 = 20$", wrong: "$25\\%$ z $80 = 25$" },
  { correct: "$20\\%$ z $45 = 9$", wrong: "$20\\%$ z $45 = 12$" },
  { correct: "$2^{3} = 8$", wrong: "$2^{3} = 6$" },
  { correct: "$5^{2} = 25$", wrong: "$5^{2} = 10$" },
  { correct: "$2^{4} = 16$", wrong: "$2^{4} = 8$" },
  { correct: "$\\sqrt{16} = 4$", wrong: "$\\sqrt{16} = 8$" },
  { correct: "$\\sqrt{25} = 5$", wrong: "$\\sqrt{25} = 12$" },
  {
    correct: "$\\sqrt{9} + \\sqrt{4} = 5$",
    wrong: "$\\sqrt{9} + \\sqrt{4} = 3$",
  },
];

export const MATURA_CLAIMS: readonly ClaimTemplate[] = [
  { correct: "$\\log_{2}(8) = 3$", wrong: "$\\log_{2}(8) = 2$" },
  { correct: "$\\log_{3}(27) = 3$", wrong: "$\\log_{3}(27) = 9$" },
  { correct: "$\\log_{10}(100) = 2$", wrong: "$\\log_{10}(100) = 10$" },
  {
    correct: "$(a + b)^{2} = a^{2} + 2ab + b^{2}$",
    wrong: "$(a + b)^{2} = a^{2} + b^{2}$",
  },
  {
    correct: "$a^{2} - b^{2} = (a - b)(a + b)$",
    wrong: "$a^{2} - b^{2} = (a - b)^{2}$",
  },
  {
    correct: "$(x + 1)(x - 1) = x^{2} - 1$",
    wrong: "$(x + 1)(x - 1) = x^{2} + 1$",
  },
  {
    correct: "$2^{3} \\times 2^{4} = 2^{7}$",
    wrong: "$2^{3} \\times 2^{4} = 2^{12}$",
  },
  { correct: "$(3^{2})^{3} = 3^{6}$", wrong: "$(3^{2})^{3} = 3^{5}$" },
  {
    correct: "$5^{6} \\div 5^{2} = 5^{4}$",
    wrong: "$5^{6} \\div 5^{2} = 5^{3}$",
  },
  {
    correct: "$f(x) = 2x,\\ f(3) = 6$",
    wrong: "$f(x) = 2x,\\ f(3) = 5$",
  },
  {
    correct: "$f(x) = x^{2},\\ f(4) = 16$",
    wrong: "$f(x) = x^{2},\\ f(4) = 8$",
  },
  {
    correct: "$x^{2} \\cdot x^{3} = x^{5}$",
    wrong: "$x^{2} \\cdot x^{3} = x^{6}$",
  },
];

/** Twierdzenia symboliczne - weryfikacja ręczna (nie parsujemy CAS). */
export const SYMBOLIC_CORRECT_CLAIMS: readonly string[] = [
  "$(a + b)^{2} = a^{2} + 2ab + b^{2}$",
  "$a^{2} - b^{2} = (a - b)(a + b)$",
  "$(x + 1)(x - 1) = x^{2} - 1$",
];

export const SYMBOLIC_WRONG_CLAIMS: readonly string[] = [
  "$(a + b)^{2} = a^{2} + b^{2}$",
  "$a^{2} - b^{2} = (a - b)^{2}$",
  "$(x + 1)(x - 1) = x^{2} + 1$",
];

function isNumericOnlyClaim(claim: string): boolean {
  return !/[a-zA-Z]/.test(latexClaimToPlain(claim));
}

export const ALL_NUMERIC_CLAIM_BANKS = [
  { name: "podstawowa", claims: PODSTAWOWA_CLAIMS },
  { name: "egzamin-8", claims: EGZAMIN_8_CLAIMS },
  {
    name: "matura-numeric",
    claims: MATURA_CLAIMS.filter((c) => isNumericOnlyClaim(c.correct)),
  },
] as const;
