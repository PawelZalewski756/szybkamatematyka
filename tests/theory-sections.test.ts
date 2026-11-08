import { describe, expect, it } from "vitest";
import {
  classifySectionKind,
  parseTheorySections,
  sectionsToHeadings,
} from "@/lib/trening/theory-sections";
import { enrichTheoryLesson } from "@/lib/trening/seed/enrich-theory";

describe("classifySectionKind", () => {
  it("maps polish section titles to kinds", () => {
    expect(classifySectionKind("Na egzaminie")).toBe("exam");
    expect(classifySectionKind("Definicje i wzory")).toBe("core");
    expect(classifySectionKind("Przykład 1 - podstawowy")).toBe("example");
    expect(classifySectionKind("Ćwiczenia do samodzielnego rozwiązania")).toBe(
      "practice",
    );
    expect(classifySectionKind("Odpowiedzi")).toBe("answers");
  });
});

describe("parseTheorySections", () => {
  it("splits markdown by h2 and assigns ids", () => {
    const content = `## Na egzaminie
Tekst egzaminu

## Definicje i wzory
$x = 1$`;

    const sections = parseTheorySections(content);
    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      title: "Na egzaminie",
      id: "na-egzaminie",
      kind: "exam",
    });
    expect(sections[1].kind).toBe("core");
  });
});

describe("sectionsToHeadings", () => {
  it("includes section kind for toc", () => {
    const headings = sectionsToHeadings(parseTheorySections(`## Pułapki\nBłędy`));
    expect(headings[0].kind).toBe("traps");
  });
});

describe("enrichTheoryLesson", () => {
  it("adds mapa, cwiczenia and odpowiedzi to short lessons", () => {
    const short = `## Na egzaminie
Często pada.

## Najważniejsze
$x = 1$

## Przykład krok po kroku
**Krok 1.** Licz.

## Pułapki
- Błąd

## Szybka powtórka
1. Co to jest x?`;

    const enriched = enrichTheoryLesson(short);
    expect(enriched).toContain("## Mapa tematu");
    expect(enriched).toContain("## Definicje i wzory");
    expect(enriched).toContain("## Ćwiczenia do samodzielnego rozwiązania");
    expect(enriched).toContain("## Odpowiedzi");
    expect(enriched.length).toBeGreaterThan(short.length);
  });

  it("does not double-enrich lessons with exercises", () => {
    const already = `## Na egzaminie
T

## Ćwiczenia do samodzielnego rozwiązania
1. Zadanie`;
    expect(enrichTheoryLesson(already)).toBe(already);
  });
});
