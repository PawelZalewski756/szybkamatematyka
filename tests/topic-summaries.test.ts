import { describe, expect, it } from "vitest";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import { getTopicSummary, TOPIC_SUMMARIES } from "@/lib/trening/summaries";

describe("topic summaries", () => {
  it("covers every CKE topic for matura and 8 klasa", () => {
    for (const examType of ["matura_podstawowa", "8_klasa"] as const) {
      for (const topic of listCkeTopicsForExam(examType)) {
        const summary = getTopicSummary(
          examType,
          topic.category,
          topic.topic,
        );
        expect(
          summary,
          `${examType}/${topic.category}/${topic.topic}`,
        ).not.toBeNull();
      }
    }
  });

  it("keeps summary keys unique and non-empty", () => {
    const keys = Object.keys(TOPIC_SUMMARIES);
    expect(new Set(keys).size).toBe(keys.length);
    for (const summary of Object.values(TOPIC_SUMMARIES)) {
      expect(summary.title.trim().length).toBeGreaterThan(0);
      expect(summary.eyebrow.trim().length).toBeGreaterThan(0);
    }
  });
});
