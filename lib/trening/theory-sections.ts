import {
  slugifyHeading,
  type MarkdownHeading,
} from "@/lib/trening/theory-content";

export type TheorySectionKind =
  | "exam"
  | "overview"
  | "core"
  | "example"
  | "traps"
  | "practice"
  | "answers"
  | "review"
  | "diagram"
  | "other";

export type TheorySection = {
  title: string;
  id: string;
  body: string;
  kind: TheorySectionKind;
};

const KIND_RULES: { kind: TheorySectionKind; pattern: RegExp }[] = [
  { kind: "exam", pattern: /^na egzaminie/i },
  { kind: "overview", pattern: /^mapa tematu|^plan lekcji|^o czym/i },
  { kind: "core", pattern: /^definicje|^najwa|^wzory|^własno|^reguły/i },
  { kind: "example", pattern: /^przykład|^zadanie przyk|^rozwiąz/i },
  { kind: "traps", pattern: /^pułapki|^błędy|^uwaga/i },
  { kind: "practice", pattern: /^ćwiczenia|^zadania do|^sprawdź się/i },
  { kind: "answers", pattern: /^odpowiedzi/i },
  { kind: "review", pattern: /^szybka powtórka|^podsumowanie|^powtórka/i },
  { kind: "diagram", pattern: /^diagram|^schemat|^rysunek/i },
];

export function classifySectionKind(title: string): TheorySectionKind {
  const normalized = title.trim();
  for (const rule of KIND_RULES) {
    if (rule.pattern.test(normalized)) return rule.kind;
  }
  return "other";
}

export const SECTION_KIND_LABEL: Record<TheorySectionKind, string> = {
  exam: "Egzamin",
  overview: "Wprowadzenie",
  core: "Teoria",
  example: "Przykłady",
  traps: "Pułapki",
  practice: "Ćwiczenia",
  answers: "Odpowiedzi",
  review: "Powtórka",
  diagram: "Schemat",
  other: "Sekcja",
};

export function parseTheorySections(content: string): TheorySection[] {
  const lines = content.split("\n");
  const sections: TheorySection[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];
  const usedIds = new Set<string>();

  const flush = () => {
    if (!currentTitle) return;
    const body = currentBody.join("\n").trim();
    if (!body && sections.length > 0) return;

    let id = slugifyHeading(currentTitle);
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${slugifyHeading(currentTitle)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    sections.push({
      title: currentTitle,
      id,
      body,
      kind: classifySectionKind(currentTitle),
    });
  };

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line.trim());
    if (match) {
      flush();
      currentTitle = match[1].replace(/\s+#+\s*$/, "").trim();
      currentBody = [];
      continue;
    }
    if (currentTitle) currentBody.push(line);
  }
  flush();

  if (sections.length === 0 && content.trim()) {
    return [
      {
        title: "Lekcja",
        id: "lekcja",
        body: content.trim(),
        kind: "other",
      },
    ];
  }

  return sections;
}

export function sectionsToHeadings(sections: TheorySection[]): MarkdownHeading[] {
  return sections.map((section) => ({
    level: 2 as const,
    text: section.title,
    id: section.id,
    kind: section.kind,
  }));
}
