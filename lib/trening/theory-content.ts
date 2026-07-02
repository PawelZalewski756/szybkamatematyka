import type { TheorySectionKind } from "@/lib/trening/theory-sections";
import { SECTION_KIND_LABEL } from "@/lib/trening/theory-sections";

export const COMPREHENSIVE_THEORY_MIN_LENGTH = 2500;

export type TheoryTier = "none" | "basic" | "full" | "comprehensive";

/** Pełna lekcja wg szablonu — ok. 500+ znaków lub sekcja „Na egzaminie”. */
export const RICH_THEORY_MIN_LENGTH = 500;

const FULL_SECTION_MARKERS = ["## Na egzaminie", "## na egzaminie"];

export type MarkdownHeading = {
  level: 2 | 3;
  text: string;
  id: string;
  /** Typ sekcji (moduł lekcji) — ustawiany przez parseTheorySections. */
  kind?: TheorySectionKind;
};

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function classifyTheoryContent(content: string | null | undefined): TheoryTier {
  if (!content?.trim()) return "none";

  const trimmed = content.trim();
  if (trimmed.length >= COMPREHENSIVE_THEORY_MIN_LENGTH) return "comprehensive";
  if (trimmed.length >= RICH_THEORY_MIN_LENGTH) return "full";
  if (FULL_SECTION_MARKERS.some((marker) => trimmed.includes(marker))) {
    return "full";
  }
  return "basic";
}

export function theoryTierLabel(tier: TheoryTier): string {
  switch (tier) {
    case "comprehensive":
      return "Teoria · pełny kurs";
    case "full":
      return "Teoria ✓";
    case "basic":
      return "Teoria · skrót";
    default:
      return "Teoria wkrótce";
  }
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const usedIds = new Set<string>();

  for (const line of content.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\s+#+\s*$/, "").trim();
    if (!text) continue;

    let id = slugifyHeading(text);
    if (!id) continue;

    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${slugifyHeading(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    headings.push({ level, text, id });
  }

  return headings;
}

export { SECTION_KIND_LABEL };
