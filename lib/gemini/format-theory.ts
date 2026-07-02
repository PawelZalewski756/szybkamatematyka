/**
 * Normalizacja lekcji teoretycznych z Gemini (Markdown + KaTeX).
 */

const GREETING_RE =
  /^\s*(siema(nko)?|siemka|hej(ka)?|cze(ść|sc)|witaj(cie)?|jasne|oczywi(ś|s)cie|spoko|no\s+dobra|dobra)[\s!,.…-]+/i;

const REQUIRED_SECTIONS = [
  "## Na egzaminie",
  "## Najważniejsze",
  "## Przykład krok po kroku",
  "## Pułapki",
  "## Szybka powtórka",
] as const;

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
    [/^##\s*najwa[żz]niejsze\s*$/gim, "## Najważniejsze"],
    [
      /^##\s*przyk[łl]ad(\s+krok\s+po\s+kroku)?\s*$/gim,
      "## Przykład krok po kroku",
    ],
    [/^##\s*pu[łl]apki\s*$/gim, "## Pułapki"],
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

export function validateTheorySections(content: string): string[] {
  const missing: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      missing.push(section.replace("## ", ""));
    }
  }
  return missing;
}

export function isTheoryLessonValid(content: string): boolean {
  return validateTheorySections(content).length === 0;
}
