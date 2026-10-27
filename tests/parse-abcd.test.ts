import { describe, expect, it } from "vitest";
import {
  cleanCkeTaskMarkup,
  isMultiClaimTrueFalse,
  parseAbcd,
} from "@/lib/baza-zadan/cke/parse-abcd";

describe("parseAbcd", () => {
  it("czyści śmieci HTML", () => {
    expect(cleanCkeTaskMarkup('tekst <ul class="x"> dalej')).toContain("tekst");
    expect(cleanCkeTaskMarkup('tekst <ul class="x"> dalej')).not.toContain("<ul");
  });

  it("usuwa urwany tag <ul class=\" bez zamykającego >", () => {
    const raw =
      "Zapisz obliczenia. <ul class=\"";
    const cleaned = cleanCkeTaskMarkup(raw);
    expect(cleaned).toBe("Zapisz obliczenia.");
    expect(cleaned).not.toContain("<ul");
    expect(cleaned).not.toContain("class=");
  });

  it("dekoduje encje HTML z arkuszy CKE", () => {
    expect(cleanCkeTaskMarkup("&fnof;(x) = x 2")).toBe("f(x) = x 2");
    expect(cleanCkeTaskMarkup("4 &frasl; 7")).toBe("4 / 7");
    expect(cleanCkeTaskMarkup("&lang;0,4&rang;")).toBe("⟨0,4⟩");
    expect(cleanCkeTaskMarkup("|&#8738;ACB| = 90°")).toBe("|∠ACB| = 90°");
  });

  it("nie psuje nierówności z <", () => {
    expect(cleanCkeTaskMarkup("0 < x < 11")).toBe("0 < x < 11");
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
});
