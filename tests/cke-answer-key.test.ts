import { describe, expect, it } from "vitest";
import { inferCorrectChoiceIndex } from "@/lib/baza-zadan/cke/answer-key";
import { parseAbcd } from "@/lib/baza-zadan/cke/parse-abcd";

describe("inferCorrectChoiceIndex", () => {
  it("maps a letter from the official solution to the matching option", () => {
    expect(
      inferCorrectChoiceIndex("D, czyli 3", ["-9", "-1/3", "1/3", "3"]),
    ).toBe(3);
    expect(
      inferCorrectChoiceIndex("**Odpowiedź:**\nB)", ["A", "B", "C", "D"]),
    ).toBe(1);
  });

  it("matches a numeric answer when the solution has no letter", () => {
    expect(inferCorrectChoiceIndex("20", ["22", "20", "12", "11"])).toBe(1);
    expect(inferCorrectChoiceIndex("5 · 4 = 20", ["10", "15", "20", "25"])).toBe(
      2,
    );
  });

  it("fails closed for multi-part or unresolved answers", () => {
    expect(inferCorrectChoiceIndex("D oraz E", ["A", "B", "C", "D"])).toBeNull();
    expect(
      inferCorrectChoiceIndex("1032,40 zł", ["image A", "image B", "image C", "image D"]),
    ).toBeNull();
  });
});

describe("parseAbcd", () => {
  it("does not turn extended and multi-part CKE tasks into a fake ABCD task", () => {
    expect(parseAbcd("Wybierz poprawne odpowiedzi A) tak B) nie E) również").hasChoices).toBe(
      false,
    );
    expect(parseAbcd("Zadanie 12.1. Wybierz A) tak B) nie").hasChoices).toBe(false);
  });
});
