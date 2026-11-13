import { describe, expect, it } from "vitest";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import {
  getTopicSummary,
  TOPIC_SUMMARIES,
  type TopicSummary,
} from "@/lib/trening/summaries";

const PILOT_KEYS = [
  "matura_podstawowa:liczby_rzeczywiste:kolejnosc_dzialan",
  "8_klasa:liczby:procenty",
  "matura_podstawowa:geometria:pitagoras_i_podobienstwo",
  "matura_podstawowa:funkcje:funkcja_kwadratowa",
  "8_klasa:geometria:okrag_i_kolo",
] as const;

function validateSummary(key: string, summary: TopicSummary) {
  expect(summary.eyebrow.trim(), `${key}: eyebrow`).not.toBe("");
  expect(summary.title.trim(), `${key}: title`).not.toBe("");

  if (summary.variant === "steps") {
    expect(summary.items.length, `${key}: liczba kroków`).toBeGreaterThanOrEqual(3);
    expect(summary.items.length, `${key}: liczba kroków`).toBeLessThanOrEqual(5);
    for (const item of summary.items) {
      expect(item.title.trim(), `${key}: tytuł kroku`).not.toBe("");
    }
    return;
  }

  if (summary.variant === "figure") {
    expect(summary.formula.trim(), `${key}: formula`).not.toBe("");
    expect(summary.bullets.length, `${key}: bullets`).toBeGreaterThan(0);
    return;
  }

  if (summary.variant === "cheatsheet") {
    expect(summary.items.length, `${key}: karty`).toBeGreaterThanOrEqual(3);
    expect(summary.items.length, `${key}: karty`).toBeLessThanOrEqual(6);
    for (const item of summary.items) {
      expect(item.title.trim(), `${key}: tytuł karty`).not.toBe("");
    }
    return;
  }

  if (summary.variant === "table") {
    expect(summary.columns.length, `${key}: kolumny`).toBeGreaterThanOrEqual(2);
    expect(summary.rows.length, `${key}: wiersze`).toBeGreaterThanOrEqual(3);
    for (const row of summary.rows) {
      expect(row.length, `${key}: długość wiersza`).toBe(summary.columns.length);
    }
    return;
  }

  expect(summary.formula.trim(), `${key}: formula`).not.toBe("");
  expect(summary.facts.length, `${key}: facts`).toBeGreaterThanOrEqual(3);
}

describe("topic summaries", () => {
  it("has a valid pilot entry for every variant", () => {
    const variants = new Set(
      PILOT_KEYS.map((key) => TOPIC_SUMMARIES[key]?.variant),
    );
    expect(variants).toEqual(new Set(["steps", "figure", "plot"]));
  });

  it("keeps every defined summary structurally valid", () => {
    for (const [key, summary] of Object.entries(TOPIC_SUMMARIES)) {
      expect(key.split(":")).toHaveLength(3);
      validateSummary(key, summary);
    }
  });

  it("resolves the pilot entries by exam, category and topic", () => {
    expect(
      getTopicSummary(
        "matura_podstawowa",
        "liczby_rzeczywiste",
        "kolejnosc_dzialan",
      ),
    ).toMatchObject({ variant: "steps" });
    expect(
      getTopicSummary("matura_podstawowa", "geometria", "pitagoras_i_podobienstwo"),
    ).toMatchObject({ variant: "figure" });
    expect(
      getTopicSummary("matura_podstawowa", "funkcje", "funkcja_kwadratowa"),
    ).toMatchObject({ variant: "plot" });
    expect(getTopicSummary("matura_podstawowa", "x", "y")).toBeNull();
  });

  it("covers every CKE topic", () => {
    expect(Object.keys(TOPIC_SUMMARIES)).toHaveLength(59);
    for (const examType of ["matura_podstawowa", "8_klasa"] as const) {
      for (const topic of listCkeTopicsForExam(examType)) {
        expect(
          getTopicSummary(examType, topic.category, topic.topic),
          `${examType}/${topic.category}/${topic.topic}`,
        ).not.toBeNull();
      }
    }
  });
});
