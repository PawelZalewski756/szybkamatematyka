import { describe, expect, it } from "vitest";
import {
  matchesLearningPath,
  normalizeLearningPath,
  questionTrackForPath,
  spClassLevel,
} from "@/lib/learning-path";

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
  it("używa klasy 8 dla SP i null dla średniej", () => {
    expect(spClassLevel("sp")).toBe(8);
    expect(spClassLevel("srednia")).toBeNull();
  });
});
