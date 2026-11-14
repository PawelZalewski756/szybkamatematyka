import { describe, expect, it } from "vitest";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import { TRAINING_CURRICULUM } from "@/lib/trening/curriculum";
import { readTaskCache } from "@/lib/trening/seed/tasks-cache-utils";
import { SEED_MATERIALS } from "@/lib/trening/seed/materials";
import { classifyTheoryContent } from "@/lib/trening/theory-content";
import { buildTopicHref, examTypeFromParam } from "@/lib/trening/slugs";
import { countsFromTasks } from "@/lib/trening/dynamic-tree";
import { mergeExamProgress } from "@/lib/trening/progress";
import { topicProgressKey } from "@/lib/supabase/solved-tasks";
import { mergeCachedTaskTreeRows } from "@/lib/supabase/tasks";

const EXAMS = ["matura_podstawowa", "8_klasa"] as const;

describe("training catalog completeness", () => {
  it("keeps the expanded catalog counts and unique canonical keys", () => {
    expect(listCkeTopicsForExam("matura_podstawowa")).toHaveLength(38);
    expect(listCkeTopicsForExam("8_klasa")).toHaveLength(38);

    const keys = EXAMS.flatMap((examType) =>
      listCkeTopicsForExam(examType).map(
        ({ category, topic }) => `${examType}:${category}:${topic}`,
      ),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every catalog topic usable tasks and complete theory", () => {
    for (const examType of EXAMS) {
      for (const slot of listCkeTopicsForExam(examType)) {
        const cache = readTaskCache({
          exam_type: examType,
          category: slot.category,
          topic: slot.topic,
        });
        expect(
          cache?.tasks.length ?? 0,
          `${examType}/${slot.category}/${slot.topic} task count`,
        ).toBeGreaterThanOrEqual(20);

        const material = SEED_MATERIALS.find(
          (entry) =>
            entry.exam_type === examType &&
            entry.category === slot.category &&
            entry.topic === slot.topic,
        );
        expect(material, `${examType}/${slot.category}/${slot.topic} theory`).toBeDefined();
        expect(["full", "comprehensive"]).toContain(
          classifyTheoryContent(material?.content),
        );
      }
    }
  });

  it("keeps cache-only topics visible and maps their progress", () => {
    const slot = {
      exam_type: "matura_podstawowa" as const,
      category: "funkcje",
      topic: "funkcja_wykladnicza",
    };
    const cache = readTaskCache(slot);
    const cachedRows =
      cache?.tasks.map(({ id }) => ({
        id,
        category: slot.category,
        topic: slot.topic,
      })) ??
      [];
    const mergedRows = mergeCachedTaskTreeRows("matura_podstawowa", [], cachedRows);
    expect(mergedRows).toHaveLength(20);

    const taskCounts = countsFromTasks(mergedRows, "matura_podstawowa");
    const key = topicProgressKey(
      "matura_podstawowa",
      slot.category,
      slot.topic,
    );
    const exam = mergeExamProgress(
      "matura_podstawowa",
      taskCounts,
      new Map([[key, 7]]),
    );
    const topic = exam.categories
      .find((category) => category.id === slot.category)
      ?.topics.find((candidate) => candidate.id === slot.topic);

    expect(topic).toMatchObject({
      total: 20,
      solved: 7,
      percent: 35,
      status: "available",
    });
  });

  it("builds canonical, resolvable links for every topic", () => {
    for (const examKey of EXAMS) {
      const exam = TRAINING_CURRICULUM[examKey];
      for (const category of exam.categories) {
        for (const topic of category.topics) {
          const href = buildTopicHref(examKey, category.id, topic.id);
          expect(href).toContain(
            examKey === "matura_podstawowa"
              ? "/trening/matura/"
              : "/trening/egzamin-osmoklasisty/",
          );
          expect(href).not.toMatch(/undefined|null|\s/);
        }
      }
    }

    expect(examTypeFromParam("matura")).toBe("matura_podstawowa");
    expect(examTypeFromParam("egzamin-osmoklasisty")).toBe("8_klasa");
  });
});
