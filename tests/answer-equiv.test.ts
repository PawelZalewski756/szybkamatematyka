import { describe, expect, it } from "vitest";
import {
  answersEquivalent,
  checkAnswerMatch,
  findEquivalentChoiceGroups,
  isNumericClaimTrue,
  parseNumericToken,
} from "@/lib/math/answer-equiv";

describe("parseNumericToken", () => {
  it("parsuje ułamki ASCII, Unicode i dziesiętne", () => {
    expect(parseNumericToken("1/2")).toBe(0.5);
    expect(parseNumericToken("½")).toBe(0.5);
    expect(parseNumericToken("0,5")).toBe(0.5);
    expect(parseNumericToken("1½")).toBe(1.5);
    expect(parseNumericToken("22 cm")).toBe(22);
  });
});

describe("answersEquivalent", () => {
  it("traktuje równoważne ułamki jako tę samą odpowiedź", () => {
    expect(answersEquivalent("1/2", "2/4")).toBe(true);
    expect(answersEquivalent("6/12", "1/2")).toBe(true);
    expect(answersEquivalent("½", "0.5")).toBe(true);
    expect(answersEquivalent("3/5", "6/10")).toBe(true);
  });

  it("rozróżnia różne wartości", () => {
    expect(answersEquivalent("1/2", "1/3")).toBe(false);
    expect(answersEquivalent("15", "16")).toBe(false);
    expect(
      answersEquivalent("9007199254740992", "9007199254740993"),
    ).toBe(false);
  });
});

describe("isNumericClaimTrue", () => {
  it("rozpoznaje poprawne twierdzenia", () => {
    expect(isNumericClaimTrue("7 + 8 = 15")).toBe(true);
    expect(isNumericClaimTrue("½ + ½ = 1")).toBe(true);
    expect(isNumericClaimTrue("¼ + ¼ = ½")).toBe(true);
  });

  it("wykrywa błędne twierdzenia (pułapki)", () => {
    expect(isNumericClaimTrue("7 + 8 = 16")).toBe(false);
    expect(isNumericClaimTrue("½ + ½ = 2/4")).toBe(false);
  });

  it("wykrywa pułapkę równoważną — ¼+¼=2/4 jest PRAWDĄ", () => {
    expect(isNumericClaimTrue("¼ + ¼ = 2/4")).toBe(true);
  });
});

describe("findEquivalentChoiceGroups", () => {
  it("znajduje duplikaty w opcjach MC", () => {
    const groups = findEquivalentChoiceGroups(["1/2", "5/7", "6/12", "2/4"]);
    expect(groups.length).toBe(1);
    expect(groups[0].sort()).toEqual([0, 2, 3]);
  });
});

describe("checkAnswerMatch", () => {
  it("akceptuje równoważne formy odpowiedzi", () => {
    expect(checkAnswerMatch("1/2", "0.5")).toBe(true);
    expect(checkAnswerMatch("6/12 cm²", "1/2 cm²")).toBe(true);
  });
});
