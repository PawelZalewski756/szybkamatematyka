import { describe, expect, it } from "vitest";
import {
  ALL_NUMERIC_CLAIM_BANKS,
  SYMBOLIC_CORRECT_CLAIMS,
  SYMBOLIC_WRONG_CLAIMS,
} from "@/lib/content/claim-banks";
import { isNumericClaimTrue } from "@/lib/math/answer-equiv";

describe("banki twierdzeń - poprawne muszą być prawdą (numeryczne)", () => {
  for (const bank of ALL_NUMERIC_CLAIM_BANKS) {
    for (const { correct } of bank.claims) {
      it(`${bank.name}: „${correct}"`, () => {
        const truth = isNumericClaimTrue(correct);
        if (truth !== null) expect(truth).toBe(true);
      });
    }
  }
});

describe("banki twierdzeń - pułapki muszą być fałszem (numeryczne)", () => {
  for (const bank of ALL_NUMERIC_CLAIM_BANKS) {
    for (const { wrong } of bank.claims) {
      it(`${bank.name}: „${wrong}"`, () => {
        const truth = isNumericClaimTrue(wrong);
        if (truth !== null) expect(truth).toBe(false);
      });
    }
  }
});

describe("banki symboliczne - rejestr ręczny", () => {
  it("poprawne i błędne wzory się nie pokrywają", () => {
    expect(SYMBOLIC_CORRECT_CLAIMS.length).toBeGreaterThan(0);
    expect(SYMBOLIC_WRONG_CLAIMS.length).toBeGreaterThan(0);
    for (const correct of SYMBOLIC_CORRECT_CLAIMS) {
      expect(SYMBOLIC_WRONG_CLAIMS).not.toContain(correct);
    }
  });
});
