import { describe, expect, it } from "vitest";
import {
  daysUntilExam,
  examDateLabel,
  isValidExamDate,
} from "@/lib/exam-date";

describe("isValidExamDate", () => {
  it("przyjmuje poprawną datę i odrzuca nieistniejące dni", () => {
    expect(isValidExamDate("2027-05-04")).toBe(true);
    expect(isValidExamDate("2026-02-31")).toBe(false);
    expect(isValidExamDate("2027-13-01")).toBe(false);
    expect(isValidExamDate("04.05.2027")).toBe(false);
  });
});

describe("daysUntilExam", () => {
  const now = new Date(2027, 4, 1, 12, 0, 0);

  it("liczy dni do przodu, dziś i po terminie", () => {
    expect(daysUntilExam("2027-05-04", now)).toBe(3);
    expect(daysUntilExam("2027-05-01", now)).toBe(0);
    expect(daysUntilExam("2027-04-29", now)).toBe(-2);
  });

  it("zwraca null dla błędnej daty", () => {
    expect(daysUntilExam("2027-02-31", now)).toBeNull();
  });
});

describe("examDateLabel", () => {
  it("formatuje datę po polsku", () => {
    const label = examDateLabel("2027-05-04");
    expect(label).toContain("2027");
    expect(label).toContain("4");
  });
});
