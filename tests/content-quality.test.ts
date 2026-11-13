import { describe, expect, it } from "vitest";
import {
  contentKey,
  countInvisibleChars,
  findDuplicateTaskGroups,
  isInvalidOption,
  pickDuplicateKeeper,
  repairChoiceOptions,
  stripInvisibleChars,
} from "@/lib/content/quality";

describe("stripInvisibleChars", () => {
  it("usuwa ZWSP, ZWNJ, ZWJ i BOM", () => {
    expect(stripInvisibleChars("Kostka\u200B\u200C\u200D\uFEFF")).toBe("Kostka");
    expect(countInvisibleChars("a\u200B\u200Bb")).toBe(2);
  });
});

describe("contentKey", () => {
  it("normalizuje spacje, wielkość liter i niewidoczne znaki", () => {
    expect(contentKey("  Oblicz   $2+2$\u200B ")).toBe("oblicz $2+2$");
  });
});

describe("isInvalidOption", () => {
  it("wykrywa artefakty generatora", () => {
    expect(isInvalidOption("NaN")).toBe(true);
    expect(isInvalidOption(" undefined ")).toBe(true);
    expect(isInvalidOption("Infinity")).toBe(true);
    expect(isInvalidOption("")).toBe(true);
    expect(isInvalidOption("-")).toBe(true);
    expect(isInvalidOption("1/8")).toBe(false);
    expect(isInvalidOption("x < 3")).toBe(false);
  });
});

describe("repairChoiceOptions", () => {
  it("zamienia NaN na sensowny dystraktor i zostawia poprawną odpowiedź", () => {
    const repaired = repairChoiceOptions("1/8", ["2/8", "1/9", "NaN", "1/8"]);
    expect(repaired).toHaveLength(4);
    expect(repaired).toContain("1/8");
    expect(repaired.some((option) => isInvalidOption(option))).toBe(false);
    expect(new Set(repaired).size).toBe(4);
  });

  it("dodaje poprawną odpowiedź, gdy jej brakuje w opcjach", () => {
    const repaired = repairChoiceOptions("7", ["5", "6", "8", "9"]);
    expect(repaired).toHaveLength(4);
    expect(repaired).toContain("7");
  });

  it("usuwa równoważne duplikaty (1/2 i 2/4)", () => {
    const repaired = repairChoiceOptions("1/2", ["1/2", "2/4", "1/3", "1/4"]);
    expect(repaired).toHaveLength(4);
    expect(repaired.filter((option) => option === "1/2" || option === "2/4")).toHaveLength(1);
  });

  it("nie psuje poprawnych czterech opcji", () => {
    const options = ["3", "4", "5", "6"];
    expect(repairChoiceOptions("4", options)).toEqual(options);
  });

  it("radzi sobie z odpowiedzią nieliczbową", () => {
    const repaired = repairChoiceOptions("x < 3", ["x > 3", "x ≤ 3", "x ≥ 3"]);
    expect(repaired).toHaveLength(4);
    expect(repaired[0]).toBe("x < 3");
  });
});

describe("findDuplicateTaskGroups", () => {
  const keyOf = (task: { topic: string }) => task.topic;

  it("grupuje identyczną treść i odpowiedź (ignorując ZWSP)", () => {
    const groups = findDuplicateTaskGroups(
      [
        { id: "a", topic: "potegi", content: "Oblicz $2^2$", correct_answer: "4" },
        { id: "b", topic: "potegi", content: "Oblicz $2^2$\u200B", correct_answer: "4" },
        { id: "c", topic: "potegi", content: "Oblicz $3^2$", correct_answer: "9" },
      ],
      keyOf,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]!.map((task) => task.id).sort()).toEqual(["a", "b"]);
  });

  it("nie grupuje zadań z inną odpowiedzią", () => {
    const groups = findDuplicateTaskGroups(
      [
        { id: "a", topic: "potegi", content: "Oblicz $2^2$", correct_answer: "4" },
        { id: "b", topic: "potegi", content: "Oblicz $2^2$", correct_answer: "5" },
      ],
      keyOf,
    );
    expect(groups).toHaveLength(0);
  });
});

describe("pickDuplicateKeeper", () => {
  it("wybiera rekord z najmniejszą liczbą niewidocznych znaków", () => {
    const keeper = pickDuplicateKeeper([
      { id: "a", content: "Treść\u200B\u200B", correct_answer: "1" },
      { id: "b", content: "Treść", correct_answer: "1" },
      { id: "c", content: "Treść\u200B", correct_answer: "1" },
    ]);
    expect(keeper.id).toBe("b");
  });

  it("przy remisie wybiera stabilnie najmniejsze id", () => {
    const keeper = pickDuplicateKeeper([
      { id: "z", content: "Treść", correct_answer: "1" },
      { id: "a", content: "Treść", correct_answer: "1" },
    ]);
    expect(keeper.id).toBe("a");
  });
});
