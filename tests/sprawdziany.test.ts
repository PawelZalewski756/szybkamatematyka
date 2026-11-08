import { buildSprawdzian, getTopicsForClass } from "@/lib/sprawdziany/builder";
import { gradeForPercent, scoreSprawdzian } from "@/lib/sprawdziany/scoring";
import { SPRAWDZIAN_TOPICS } from "@/lib/sprawdziany/topics";
import { describe, expect, it } from "vitest";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("sprawdziany — generatory", () => {
  it("każdy szablon daje poprawne pytanie dla wielu losowań", () => {
    for (const topic of SPRAWDZIAN_TOPICS) {
      for (const template of topic.templates) {
        for (let seed = 1; seed <= 1500; seed++) {
          const q = template.generate(seeded(seed));
          const ctx = `${template.id} seed=${seed}: ${q.prompt}`;
          expect(q.choices, ctx).toHaveLength(4);
          expect(new Set(q.choices).size, ctx).toBe(4);
          expect(q.correctIndex, ctx).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex, ctx).toBeLessThan(4);
          expect(q.explanation.trim(), ctx).not.toBe("");
          for (const text of [q.prompt, ...q.choices]) {
            expect(text, ctx).not.toMatch(/NaN|undefined|Infinity/);
          }
        }
      }
    }
  }, 30_000);

  it("identyfikatory szablonów i tematów są unikalne", () => {
    const topicIds = SPRAWDZIAN_TOPICS.map((t) => t.id);
    const templateIds = SPRAWDZIAN_TOPICS.flatMap((t) =>
      t.templates.map((x) => x.id),
    );
    expect(new Set(topicIds).size).toBe(topicIds.length);
    expect(new Set(templateIds).size).toBe(templateIds.length);
  });
});

describe("sprawdziany — builder", () => {
  const ids = getTopicsForClass(8).map((t) => t.id);

  it("zwraca żądaną liczbę pytań bez powtórzeń treści", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const qs = buildSprawdzian({
        schoolClass: 8,
        topicIds: ids,
        count: 12,
        rng: seeded(seed),
      });
      expect(qs).toHaveLength(12);
      expect(new Set(qs.map((q) => q.prompt)).size).toBe(12);
    }
  });

  it("pytania pochodzą tylko z wybranych tematów i rosną trudnością", () => {
    const qs = buildSprawdzian({
      schoolClass: 8,
      topicIds: ["procenty", "pitagoras"],
      count: 8,
      rng: seeded(7),
    });
    expect(qs.every((q) => ["procenty", "pitagoras"].includes(q.topicId))).toBe(
      true,
    );
    expect(new Set(qs.map((q) => q.topicId)).size).toBe(2);
    const levels = qs.map((q) => q.level);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });

  it("klasa 7 buduje poprawne sprawdziany bez szablonów tylko dla klasy 8", () => {
    const ids7 = getTopicsForClass(7).map((t) => t.id);
    expect(ids7).toContain("katy-trojkaty");
    expect(ids7).not.toContain("pitagoras");
    const only8 = new Set(
      SPRAWDZIAN_TOPICS.flatMap((t) =>
        t.templates
          .filter((x) => x.classes && !x.classes.includes(7))
          .map((x) => x.id),
      ),
    );
    const offered7 = new Set(
      getTopicsForClass(7).flatMap((t) => t.templates.map((x) => x.id)),
    );
    expect(only8.size).toBeGreaterThan(0);
    for (const id of only8) expect(offered7.has(id)).toBe(false);
    for (let seed = 1; seed <= 50; seed++) {
      const qs = buildSprawdzian({
        schoolClass: 7,
        topicIds: ids7,
        count: 10,
        rng: seeded(seed),
      });
      expect(qs).toHaveLength(10);
    }
  });

  it("pusta lista tematów lub klasa bez tematów daje pusty sprawdzian", () => {
    expect(buildSprawdzian({ schoolClass: 8, topicIds: [] })).toEqual([]);
    expect(buildSprawdzian({ schoolClass: 3, topicIds: ids })).toEqual([]);
  });
});

describe("sprawdziany — ocena", () => {
  it("progi ocen", () => {
    expect(gradeForPercent(100).value).toBe(6);
    expect(gradeForPercent(90).value).toBe(5);
    expect(gradeForPercent(75).value).toBe(4);
    expect(gradeForPercent(50).value).toBe(3);
    expect(gradeForPercent(30).value).toBe(2);
    expect(gradeForPercent(29).value).toBe(1);
  });

  it("liczy wynik i rozbicie po tematach", () => {
    const qs = buildSprawdzian({
      schoolClass: 8,
      topicIds: ["ulamki"],
      count: 4,
      rng: seeded(3),
    });
    const answers = Object.fromEntries(
      qs.map((q, i) => [q.id, i < 3 ? q.correctIndex : (q.correctIndex + 1) % 4]),
    );
    const r = scoreSprawdzian(qs, answers);
    expect(r.correct).toBe(3);
    expect(r.percent).toBe(75);
    expect(r.byTopic.ulamki).toEqual({ correct: 3, total: 4 });
  });
});
