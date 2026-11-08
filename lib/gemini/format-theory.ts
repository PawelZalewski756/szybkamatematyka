/**
 * Normalizacja lekcji teoretycznych z Gemini (Markdown + KaTeX).
 */

const GREETING_RE =
  /^\s*(siema(nko)?|siemka|hej(ka)?|cze(ść|sc)|witaj(cie)?|jasne|oczywi(ś|s)cie|spoko|no\s+dobra|dobra)[\s!,.…-]+/i;

/** Pełny kurs Phase 3a (Gemini). */
const PHASE3A_SECTION_CHECKS: readonly { label: string; pattern: RegExp }[] = [
  { label: "Na egzaminie", pattern: /##\s*Na egzaminie/i },
  { label: "Mapa tematu", pattern: /##\s*Mapa tematu/i },
  { label: "Definicje i wzory", pattern: /##\s*Definicje/i },
  { label: "Przykład 1", pattern: /##\s*Przykład\s*1/i },
  { label: "Pułapki", pattern: /##\s*Pułapki/i },
  {
    label: "Ćwiczenia",
    pattern: /##\s*Ćwiczenia/i,
  },
  { label: "Odpowiedzi", pattern: /##\s*Odpowiedzi/i },
  { label: "Szybka powtórka", pattern: /##\s*Szybka powtórka/i },
];

/** Starszy format 5-sekcji (cache sprzed Phase 3a). */
const LEGACY_SECTION_CHECKS: readonly { label: string; pattern: RegExp }[] = [
  { label: "Na egzaminie", pattern: /^##\s*Na egzaminie\s*$/im },
  { label: "Najważniejsze", pattern: /^##\s*Najważniejsze\s*$/im },
  {
    label: "Przykład krok po kroku",
    pattern: /^##\s*Przykład krok po kroku\s*$/im,
  },
  { label: "Pułapki", pattern: /^##\s*Pułapki\s*$/im },
  { label: "Szybka powtórka", pattern: /^##\s*Szybka powtórka\s*$/im },
];

export const THEORY_MIN_PHASE3A_CHARS = 2500;

function stripCodeFenceWrapper(text: string): string {
  const fence = text.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```$/);
  if (fence) return fence[1].trim();
  return text;
}

function convertLatexDelimiters(text: string): string {
  let out = text;
  out = out.replace(/\\\[/g, () => "$$").replace(/\\\]/g, () => "$$");
  out = out.replace(/\\\(/g, () => "$").replace(/\\\)/g, () => "$");
  return out;
}

function stripGreetings(text: string): string {
  let out = text.trim();
  for (let i = 0; i < 3 && GREETING_RE.test(out); i++) {
    out = out.replace(GREETING_RE, "").trim();
  }
  return out;
}

function demoteH1ToH2(text: string): string {
  return text.replace(/^#[ \t]+(?!#)(.+)$/gm, "## $1");
}

function normalizeSectionHeadings(text: string): string {
  const replacements: [RegExp, string][] = [
    [/^##\s*na\s+egzaminie\s*$/gim, "## Na egzaminie"],
    [/^##\s*mapa\s+tematu\s*$/gim, "## Mapa tematu"],
    [
      /^##\s*definicje(\s+i\s+wzory)?\s*$/gim,
      "## Definicje i wzory",
    ],
    [/^##\s*najwa[żz]niejsze\s*$/gim, "## Najważniejsze"],
    [
      /^##\s*przyk[łl]ad\s*1(\s*[--]\s*.+)?\s*$/gim,
      "## Przykład 1 - podstawowy",
    ],
    [
      /^##\s*przyk[łl]ad\s*2(\s*[--]\s*.+)?\s*$/gim,
      "## Przykład 2 - maturalny",
    ],
    [
      /^##\s*przyk[łl]ad(\s+krok\s+po\s+kroku)?\s*$/gim,
      "## Przykład krok po kroku",
    ],
    [/^##\s*pu[łl]apki\s*$/gim, "## Pułapki"],
    [
      /^##\s*ćwiczenia(\s+do\s+samodzielnego\s+rozwiązania)?\s*$/gim,
      "## Ćwiczenia do samodzielnego rozwiązania",
    ],
    [/^##\s*odpowiedzi\s*$/gim, "## Odpowiedzi"],
    [/^##\s*szybka\s+powt[óo]rka\s*$/gim, "## Szybka powtórka"],
    [/^##\s*diagram\s*$/gim, "## Diagram"],
  ];
  let out = text;
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function normalizeStepHeadings(text: string): string {
  return text.replace(
    /^[ \t]*\*{0,2}\s*krok\s*(\d+)\s*[:.)\-–]?\s*\*{0,2}[ \t]*/gim,
    (_m, n: string) => `**Krok ${n}.** `,
  );
}

function fixMathArtifacts(text: string): string {
  let out = text;
  out = out.replace(/\${3,}/g, () => "$$");
  return out;
}

function tidyWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type ParsedTheoryLesson = {
  title: string;
  content: string;
};

export type TheoryFormatTier = "phase3a" | "legacy" | "invalid";

export function parseTheoryTitleAndBody(raw: string): ParsedTheoryLesson {
  const lines = raw.split("\n");
  let title = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const titleMatch = /^TYTU[ŁL]:\s*(.+)$/i.exec(line);
    if (titleMatch) {
      title = titleMatch[1].trim();
      bodyStart = i + 1;
      while (bodyStart < lines.length && !lines[bodyStart].trim()) {
        bodyStart += 1;
      }
      break;
    }
  }

  const content = lines.slice(bodyStart).join("\n").trim();
  return { title, content };
}

export function normalizeTheoryContent(text: string): string {
  if (!text) return "";

  let out = text.replace(/\uFEFF/g, "").trim();
  out = stripCodeFenceWrapper(out);
  out = convertLatexDelimiters(out);
  out = stripGreetings(out);
  out = demoteH1ToH2(out);
  out = normalizeSectionHeadings(out);
  out = normalizeStepHeadings(out);
  out = fixMathArtifacts(out);
  out = tidyWhitespace(out);
  return out;
}

export function normalizeTheoryLesson(raw: string): ParsedTheoryLesson {
  const normalized = normalizeTheoryContent(raw);
  const { title, content } = parseTheoryTitleAndBody(normalized);
  const body = title ? content : normalized;
  const finalTitle = title || "Lekcja";
  const finalContent = title ? body : normalized;
  return {
    title: finalTitle,
    content: normalizeTheoryContent(finalContent),
  };
}

function sectionPresent(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

function missingSections(
  content: string,
  checks: readonly { label: string; pattern: RegExp }[],
): string[] {
  const missing: string[] = [];
  for (const check of checks) {
    if (!sectionPresent(content, check.pattern)) {
      missing.push(check.label);
    }
  }
  return missing;
}

export function detectTheoryFormatTier(content: string): TheoryFormatTier {
  if (missingSections(content, PHASE3A_SECTION_CHECKS).length === 0) {
    return "phase3a";
  }
  if (missingSections(content, LEGACY_SECTION_CHECKS).length === 0) {
    return "legacy";
  }
  return "invalid";
}

export function validateTheorySections(content: string): string[] {
  const tier = detectTheoryFormatTier(content);
  if (tier === "phase3a") {
    return missingSections(content, PHASE3A_SECTION_CHECKS);
  }
  if (tier === "legacy") {
    return missingSections(content, LEGACY_SECTION_CHECKS);
  }
  const phase3Missing = missingSections(content, PHASE3A_SECTION_CHECKS);
  return phase3Missing.length > 0 ? phase3Missing : ["format"];
}

export function isTheoryLessonValid(content: string): boolean {
  return detectTheoryFormatTier(content) !== "invalid";
}

export function isPhase3aTheoryLesson(content: string): boolean {
  return (
    detectTheoryFormatTier(content) === "phase3a" &&
    content.length >= THEORY_MIN_PHASE3A_CHARS
  );
}
