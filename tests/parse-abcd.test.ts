import { describe, expect, it } from "vitest";
import {
  cleanCkeTaskMarkup,
  isMultiClaimTrueFalse,
  parseAbcd,
  resolveCkeAnswer,
} from "@/lib/baza-zadan/cke/parse-abcd";

describe("parseAbcd", () => {
  it("czyści śmieci HTML", () => {
    expect(cleanCkeTaskMarkup('tekst <ul class="x"> dalej')).toContain("tekst");
    expect(cleanCkeTaskMarkup('tekst <ul class="x"> dalej')).not.toContain("<ul");
  });

  it("wykrywa zadania P/F wielostwierdzeniowe", () => {
    expect(
      isMultiClaimTrueFalse(
        "Oceń prawdziwość poniższych stwierdzeń. A) prawda B) fałsz",
      ),
    ).toBe(true);
  });

  it("traktuje P/F multi jako zadanie otwarte", () => {
    const tresc =
      "Zadanie 31.1. Oceń prawdziwość poniższych stwierdzeń. " +
      "Łączna liczba klientów jest równa L(30). A) prawda B) fałsz " +
      "W trzecim dniu obsłużono 336 klientów. A) prawda B) fałsz";
    const parsed = parseAbcd(tresc);
    expect(parsed.hasChoices).toBe(false);
    expect(parsed.choices[0]).toMatch(/otwarte/i);
    expect(parsed.prompt).toContain("Oceń prawdziwość");
  });

  it("parsuje zwykłe ABCD", () => {
    const parsed = parseAbcd(
      "Wartość wyrażenia jest równa A) 1 B) 2 C) 3 D) 4",
    );
    expect(parsed.hasChoices).toBe(true);
    expect(parsed.choices).toEqual(["1", "2", "3", "4"]);
    expect(parsed.prompt).toContain("Wartość wyrażenia");
  });

  it("rozpoznaje jednoznaczną literę z linii odpowiedzi", () => {
    const task = parseAbcd("Ile to jest? A) 1 B) 2 C) 3 D) 4");
    expect(
      resolveCkeAnswer(
        "**Krok 1.** Obliczamy.\n\n**Odpowiedź:** C, czyli 3",
        task,
      ),
    ).toEqual({ status: "resolved", correctIndex: 2, letter: "C" });
  });

  it("nie zgaduje odpowiedzi opisowej", () => {
    const task = parseAbcd("Wybierz wykres. A) a B) b C) c D) d");
    expect(
      resolveCkeAnswer(
        "Odpowiedź: wybierz rysunek zgodny z kluczem CKE (zazwyczaj C).",
        task,
      ).status,
    ).toBe("ambiguous");
  });

  it("nie punktuje wielu odpowiedzi", () => {
    const task = parseAbcd("Wybierz odpowiedzi. A) a B) b C) c D) d");
    expect(resolveCkeAnswer("Odpowiedź: B i D", task).status).toBe(
      "ambiguous",
    );
  });

  it("oznacza zadanie otwarte jako nieoceniane", () => {
    const task = parseAbcd("Oblicz wartość wyrażenia i zapisz obliczenia.");
    expect(resolveCkeAnswer("Odpowiedź: 42", task).status).toBe("ungraded");
  });
});
