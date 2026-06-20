import { describe, it, expect } from "vitest";
import {
  normalizeSolution,
  isSolutionPlaceholder,
  formatSolutionForDisplay,
} from "@/lib/gemini/format-solution";

describe("normalizeSolution — delimitery LaTeX", () => {
  it("konwertuje \\(..\\) na $..$", () => {
    expect(normalizeSolution("Wynik to \\(x + 1\\) gotowe")).toBe(
      "Wynik to $x + 1$ gotowe",
    );
  });

  it("konwertuje \\[..\\] na $$..$$", () => {
    expect(normalizeSolution("\\[x = 2\\]")).toBe("$$x = 2$$");
  });
});

describe("normalizeSolution — bloki kodu", () => {
  it("usuwa otaczający blok ```markdown", () => {
    const input = "```markdown\nTreść rozwiązania\n```";
    expect(normalizeSolution(input)).toBe("Treść rozwiązania");
  });

  it("usuwa otaczający blok bez języka", () => {
    const input = "```\nabc\n```";
    expect(normalizeSolution(input)).toBe("abc");
  });
});

describe("normalizeSolution — etykiety", () => {
  it("ujednolica 'Krok 1.' do '**Krok 1.**'", () => {
    expect(normalizeSolution("Krok 1: oblicz")).toBe("**Krok 1.** oblicz");
    expect(normalizeSolution("Krok 2) policz")).toBe("**Krok 2.** policz");
  });

  it("ujednolica linię odpowiedzi do '**Odpowiedź:**'", () => {
    expect(normalizeSolution("Odpowiedź: 5")).toBe("**Odpowiedź:** 5");
    expect(normalizeSolution("odpowiedz - 5")).toBe("**Odpowiedź:** 5");
  });
});

describe("normalizeSolution — artefakty matematyczne", () => {
  it("zamienia potrójne dolary na blokowe $$", () => {
    expect(normalizeSolution("$$$x$$$")).toBe("$$x$$");
  });

  it("zamienia mnożenie * na \\cdot wewnątrz trybu matematycznego", () => {
    expect(normalizeSolution("$2 * 3$")).toBe("$2 \\cdot 3$");
  });
});

describe("normalizeSolution — przypadki brzegowe", () => {
  it("pusty/whitespace wejście → pusty string", () => {
    expect(normalizeSolution("")).toBe("");
    expect(normalizeSolution("   \n  ")).toBe("");
  });

  it("nie psuje poprawnie sformatowanego wejścia (idempotencja)", () => {
    const clean = "**Krok 1.** Policz $x$.\n\n**Odpowiedź:** $x = 2$";
    expect(normalizeSolution(clean)).toBe(clean);
    expect(normalizeSolution(normalizeSolution(clean))).toBe(clean);
  });

  it("usuwa powitania z początku odpowiedzi", () => {
    expect(normalizeSolution("Siema! Krok 1: licz")).toBe("**Krok 1.** licz");
  });
});

describe("isSolutionPlaceholder", () => {
  it("rozpoznaje pusty tekst i znaczniki placeholderów", () => {
    expect(isSolutionPlaceholder("")).toBe(true);
    expect(isSolutionPlaceholder("   ")).toBe(true);
    expect(isSolutionPlaceholder("Rozwiązanie zostanie uzupełnione")).toBe(true);
    expect(isSolutionPlaceholder("Rozwiązanie w przygotowaniu")).toBe(true);
  });

  it("normalny tekst nie jest placeholderem", () => {
    expect(isSolutionPlaceholder("Krok 1: policz")).toBe(false);
  });
});

describe("formatSolutionForDisplay", () => {
  it("placeholder zwraca bez zmian", () => {
    const placeholder = "Rozwiązanie zostanie uzupełnione";
    expect(formatSolutionForDisplay(placeholder)).toBe(placeholder);
  });

  it("wyciąga i numeruje kroki z tablicy JSON", () => {
    const json = JSON.stringify(["pierwszy", "drugi"]);
    expect(formatSolutionForDisplay(json)).toBe(
      "**Krok 1.** pierwszy\n\n**Krok 2.** drugi",
    );
  });

  it("normalizuje zwykły tekst tak jak normalizeSolution", () => {
    expect(formatSolutionForDisplay("Krok 1: \\(x\\)")).toBe("**Krok 1.** $x$");
  });
});
