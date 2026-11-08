import { describe, expect, it } from "vitest";
import {
  normalizeTheoryContent,
  normalizeTheoryLesson,
  parseTheoryTitleAndBody,
  validateTheorySections,
} from "@/lib/gemini/format-theory";

describe("normalizeTheoryLesson", () => {
  it("parses TYTUŁ line and validates legacy sections", () => {
    const raw = `TYTUŁ: Równania liniowe

## Na egzaminie
Częsty temat.

## Najważniejsze
- $ax+b=0$

## Przykład krok po kroku
**Krok 1.** Liczymy.

## Pułapki
- Znak minus

## Szybka powtórka
1. Co to jest?`;

    const lesson = normalizeTheoryLesson(raw);
    expect(lesson.title).toBe("Równania liniowe");
    expect(validateTheorySections(lesson.content)).toEqual([]);
  });

  it("validates Phase 3a sections", () => {
    const content = `## Na egzaminie
Tekst.

## Mapa tematu
1. Punkt

## Definicje i wzory
- wzór

## Przykład 1 - podstawowy
**Krok 1.** Liczymy.

## Pułapki
- błąd

## Ćwiczenia do samodzielnego rozwiązania
1. Zadanie

## Odpowiedzi
1. Wynik

## Szybka powtórka
1. Pytanie?`;

    expect(validateTheorySections(content)).toEqual([]);
  });

  it("converts \\( \\) delimiters to dollars", () => {
    const out = normalizeTheoryContent("## Najważniejsze\n\\(x=1\\)");
    expect(out).toContain("$x=1$");
  });
});

describe("parseTheoryTitleAndBody", () => {
  it("handles missing title", () => {
    const { title, content } = parseTheoryTitleAndBody("## Na egzaminie\nTekst");
    expect(title).toBe("");
    expect(content).toContain("Na egzaminie");
  });
});
