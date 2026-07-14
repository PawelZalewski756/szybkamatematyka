import {
  checkAnswerMatch,
  findEquivalentChoiceGroups,
} from "@/lib/math/answer-equiv";

export type TaskAnswerType = "choice" | "open";

export type ParsedGeminiTask = {
  content: string;
  correct_answer: string;
  options: string[];
  answer_type: TaskAnswerType;
  difficulty: 1 | 2 | 3;
  xp_reward: number;
  explanation: string;
  figure_svg: string | null;
  figure_caption: string | null;
};

export function isOpenTask(task: Pick<ParsedGeminiTask, "options" | "answer_type">): boolean {
  return task.answer_type === "open" || task.options.length === 0;
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

function coerceDifficulty(value: unknown): 1 | 2 | 3 {
  const n = Number(value);
  if (n === 2 || n === 3) return n;
  return 1;
}

function coerceXp(difficulty: 1 | 2 | 3, value: unknown): number {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 5 && n <= 50) return Math.round(n);
  if (difficulty === 1) return 12;
  if (difficulty === 2) return 16;
  return 22;
}

function normalizeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => String(o ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeSvg(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const svg = raw.trim();
  if (!svg.includes("<svg")) return null;
  return svg;
}

function repairJsonBackslashes(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const c = json[i]!;

    if (!inString) {
      out += c;
      if (c === '"') {
        inString = true;
        escaped = false;
      }
      continue;
    }

    if (escaped) {
      out += c;
      escaped = false;
      continue;
    }

    if (c === "\\") {
      const next = json[i + 1];
      if (next && '"\\/bfnrtu'.includes(next)) {
        out += c;
        escaped = true;
      } else {
        out += "\\\\";
      }
      continue;
    }

    if (c === '"') {
      inString = false;
    }
    out += c;
  }

  return out;
}

function extractJsonArrayText(raw: string): string {
  const cleaned = stripCodeFence(raw);
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export function parseGeminiTasksJson(raw: string): unknown[] {
  const arrayText = extractJsonArrayText(raw);
  const attempts = [arrayText, repairJsonBackslashes(arrayText)];

  let lastError: Error | null = null;
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed)) return parsed;
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { tasks?: unknown[] }).tasks)
      ) {
        return (parsed as { tasks: unknown[] }).tasks;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Odpowiedź nie jest tablicą JSON zadań.");
}

function normalizeChoiceTask(row: Record<string, unknown>): ParsedGeminiTask | null {
  const content = String(row.content ?? "").trim();
  const correct_answer = String(row.correct_answer ?? "").trim();
  const options = normalizeOptions(row.options);
  const difficulty = coerceDifficulty(row.difficulty);
  const xp_reward = coerceXp(difficulty, row.xp_reward);
  const explanation = String(row.explanation ?? "").trim();
  const figure_svg = normalizeSvg(row.figure_svg);
  const figure_caption =
    typeof row.figure_caption === "string" && row.figure_caption.trim()
      ? row.figure_caption.trim()
      : null;

  if (!content || content.length < 12) return null;
  if (options.length !== 4) return null;
  if (!correct_answer) return null;

  const unique = new Set(options.map((o) => o.toLowerCase()));
  if (unique.size !== 4) return null;

  const hasCorrect = options.some((o) => checkAnswerMatch(o, correct_answer));
  if (!hasCorrect) return null;

  const equiv = findEquivalentChoiceGroups(options);
  if (equiv.length > 0) return null;

  return {
    content,
    correct_answer,
    options,
    answer_type: "choice",
    difficulty,
    xp_reward,
    explanation,
    figure_svg,
    figure_caption,
  };
}

function normalizeOpenTask(row: Record<string, unknown>): ParsedGeminiTask | null {
  const content = String(row.content ?? "").trim();
  const correct_answer = String(row.correct_answer ?? "").trim();
  const difficulty = coerceDifficulty(row.difficulty);
  const xp_reward = coerceXp(difficulty, row.xp_reward);
  const explanation = String(row.explanation ?? "").trim();
  const figure_svg = normalizeSvg(row.figure_svg);
  const figure_caption =
    typeof row.figure_caption === "string" && row.figure_caption.trim()
      ? row.figure_caption.trim()
      : null;

  if (!content || content.length < 12) return null;
  if (!correct_answer || correct_answer.length > 120) return null;

  return {
    content,
    correct_answer,
    options: [],
    answer_type: "open",
    difficulty,
    xp_reward: Math.max(xp_reward, difficulty === 1 ? 14 : difficulty === 2 ? 18 : 22),
    explanation,
    figure_svg,
    figure_caption,
  };
}

export function normalizeGeminiTask(raw: unknown): ParsedGeminiTask | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const answerType = String(row.answer_type ?? "").toLowerCase();
  const options = normalizeOptions(row.options);

  if (answerType === "open" || options.length === 0) {
    return normalizeOpenTask(row);
  }
  return normalizeChoiceTask(row);
}

export function validateGeminiTask(task: ParsedGeminiTask): string[] {
  const issues: string[] = [];
  if (!task.content.trim()) issues.push("empty content");
  if (isOpenTask(task)) {
    if (!task.correct_answer.trim()) issues.push("empty correct_answer");
    return issues;
  }
  if (task.options.length !== 4) issues.push("options !== 4");
  if (!task.options.some((o) => checkAnswerMatch(o, task.correct_answer))) {
    issues.push("correct_answer mismatch");
  }
  return issues;
}

/** Łączy SVG z treścią zadania (format pod markdown w bazie). */
export function taskContentForDb(task: Pick<ParsedGeminiTask, "content" | "figure_svg" | "figure_caption">): string {
  if (!task.figure_svg) return task.content.trim();

  const caption = task.figure_caption ?? "Ilustracja do zadania";
  const encoded = encodeURIComponent(task.figure_svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `![${caption}](data:image/svg+xml,${encoded})\n\n${task.content.trim()}`;
}

export function contentFingerprint(content: string): string {
  return content.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 160);
}
