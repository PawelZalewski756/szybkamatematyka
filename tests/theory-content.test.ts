import { describe, expect, it } from "vitest";
import {
  classifyTheoryContent,
  extractMarkdownHeadings,
  slugifyHeading,
} from "@/lib/trening/theory-content";

describe("slugifyHeading", () => {
  it("normalizes polish characters", () => {
    expect(slugifyHeading("Pułapki maturalne")).toBe("pulapki-maturalne");
  });
});

describe("extractMarkdownHeadings", () => {
  it("extracts h2 and h3 with unique ids", () => {
    const content = `## Na egzaminie
Tekst

## Definicja

### Przykład
Inny

## Definicja`;

    expect(extractMarkdownHeadings(content)).toEqual([
      { level: 2, text: "Na egzaminie", id: "na-egzaminie" },
      { level: 2, text: "Definicja", id: "definicja" },
      { level: 3, text: "Przykład", id: "przyklad" },
      { level: 2, text: "Definicja", id: "definicja-2" },
    ]);
  });
});

describe("classifyTheoryContent", () => {
  it("returns none for empty content", () => {
    expect(classifyTheoryContent(null)).toBe("none");
    expect(classifyTheoryContent("   ")).toBe("none");
  });

  it("returns basic for short cheat sheets", () => {
    expect(classifyTheoryContent("## Definicja\n\n$x=1$")).toBe("basic");
  });

  it("returns full for template marker or length", () => {
    expect(
      classifyTheoryContent("## Na egzaminie\n\nKrótki opis tematu."),
    ).toBe("full");
    expect(classifyTheoryContent("x".repeat(500))).toBe("full");
  });

  it("returns comprehensive for long lessons", () => {
    expect(classifyTheoryContent("x".repeat(2500))).toBe("comprehensive");
  });
});
