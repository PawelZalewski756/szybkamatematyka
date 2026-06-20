export type ParsedSolution = {
  steps: string[];
  answer: string | null;
};

const ANSWER_LINE_RE = /\n\*\*Odpowiedź:\*\*\s*([\s\S]+)$/i;
const STEP_SPLIT_RE = /\n(?=\*\*Krok\s+\d+\.\*\*)/i;
const STEP_PREFIX_RE = /^\*\*Krok\s+\d+\.\*\*\s*/i;

export function parseSolutionSteps(markdown: string): ParsedSolution {
  const trimmed = markdown.trim();
  if (!trimmed) return { steps: [], answer: null };

  let body = trimmed;
  let answer: string | null = null;

  const answerMatch = trimmed.match(ANSWER_LINE_RE);
  if (answerMatch) {
    answer = answerMatch[1].trim();
    body = trimmed.slice(0, answerMatch.index).trim();
  }

  const chunks = body.split(STEP_SPLIT_RE).filter(Boolean);
  const steps = chunks
    .map((chunk) => chunk.replace(STEP_PREFIX_RE, "").trim())
    .filter(Boolean);

  if (steps.length === 0 && body) {
    return { steps: [body], answer };
  }

  return { steps, answer };
}
