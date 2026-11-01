import { describe, expect, it } from "vitest";
import {
  learningPathFromSchoolClass,
  matchesLearningPath,
  normalizeLearningPath,
  normalizeSchoolClass,
  questionTrackForPath,
  SCHOOL_LEVEL_OPTIONS,
  spClassLevel,
} from "@/lib/learning-path";

describe("school level options", () => {
  it("offers only elementary or secondary school", () => {
    expect(SCHOOL_LEVEL_OPTIONS).toEqual([
      { value: "sp", label: "Szkoła podstawowa" },
      { value: "srednia", label: "Szkoła średnia" },
    ]);
  });
});

describe("normalizeLearningPath", () => {
  it("zostawia sp i srednia bez zmian", () => {
    expect(normalizeLearningPath("sp")).toBe("sp");
    expect(normalizeLearningPath("srednia")).toBe("srednia");
  });

  it("mapuje klasy SP na sp", () => {
    expect(normalizeLearningPath("klasa-3")).toBe("sp");
    expect(normalizeLearningPath("klasa-8")).toBe("sp");
  });

  it("mapuje szkoły średnie na srednia", () => {
    expect(normalizeLearningPath("liceum-2")).toBe("srednia");
    expect(normalizeLearningPath("technikum-4")).toBe("srednia");
    expect(normalizeLearningPath("zawodowa-1")).toBe("srednia");
    expect(normalizeLearningPath("matura")).toBe("srednia");
  });

  it("zwraca null dla nieznanych wartości", () => {
    expect(normalizeLearningPath("gimnazjum")).toBeNull();
  });
});

describe("normalizeSchoolClass", () => {
  it("mapuje legacy sp/srednia na konkretne klasy", () => {
    expect(normalizeSchoolClass("sp")).toBe("klasa-8");
    expect(normalizeSchoolClass("srednia")).toBe("liceum-3");
    expect(normalizeSchoolClass("klasa-5")).toBe("klasa-5");
  });
});

describe("learningPathFromSchoolClass", () => {
  it("wyprowadza sp lub srednia z klasy", () => {
    expect(learningPathFromSchoolClass("klasa-4")).toBe("sp");
    expect(learningPathFromSchoolClass("liceum-1")).toBe("srednia");
  });
});

describe("matchesLearningPath", () => {
  it("dopasowuje SP do klas i egzaminu 8", () => {
    expect(matchesLearningPath("sp", ["klasa-7", "klasa-8"])).toBe(true);
    expect(matchesLearningPath("sp", ["egzamin-8"])).toBe(true);
    expect(matchesLearningPath("sp", ["sp"])).toBe(true);
    expect(matchesLearningPath("sp", ["liceum"])).toBe(false);
    expect(matchesLearningPath("sp", ["matura"])).toBe(false);
  });

  it("dopasowuje szkołę średnią do grup i matury", () => {
    expect(matchesLearningPath("srednia", ["technikum"])).toBe(true);
    expect(matchesLearningPath("srednia", ["liceum-3", "liceum-4"])).toBe(
      true,
    );
    expect(matchesLearningPath("srednia", ["zawodowa-2"])).toBe(true);
    expect(matchesLearningPath("srednia", ["matura"])).toBe(true);
    expect(matchesLearningPath("srednia", ["klasa-8"])).toBe(false);
  });
});

describe("questionTrackForPath", () => {
  it("przypisuje właściwy tor pytań", () => {
    expect(questionTrackForPath("sp")).toBe("egzamin-8-klasisty");
    expect(questionTrackForPath("srednia")).toBe("matura");
  });
});

describe("spClassLevel", () => {
  it("używa klasy 8 dla SP bez podanej klasy", () => {
    expect(spClassLevel("sp")).toBe(8);
    expect(spClassLevel("srednia")).toBeNull();
  });

  it("używa konkretnej klasy SP gdy podana", () => {
    expect(spClassLevel("sp", "klasa-3")).toBe(3);
    expect(spClassLevel("srednia", "liceum-2")).toBeNull();
  });
});
