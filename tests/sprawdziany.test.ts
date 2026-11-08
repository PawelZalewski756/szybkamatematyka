import { describe, expect, it } from "vitest";
import {
  SHEET_CHAPTERS,
  buildSheet,
  gradeForPoints,
  gradeTable,
  mulberry32,
} from "@/lib/sprawdziany/sheet";
import type { Figure, SheetTask } from "@/lib/sprawdziany/types";

const SEEDS = 400;

function textOf(task: SheetTask): string {
  const base = [task.prompt, ...task.solution];
  if (task.kind === "closed") base.push(...task.choices);
  if (task.kind === "tf") base.push(...task.statements.map((s) => s.text));
  if (task.kind === "open") {
    base.push(task.key, ...(task.parts ?? []), ...task.scheme.map((s) => s.text));
  }
  return base.join("\n");
}

function figureLabels(f: Figure): unknown[] {
  return Object.values(f).filter((v) => typeof v !== "string" || v !== f.kind);
}

describe("sprawdziany – arkusze", () => {
  for (const chapter of SHEET_CHAPTERS) {
    describe(chapter.id, () => {
      it("generuje poprawne zadania dla wielu ziaren", () => {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const rng = mulberry32(seed);
          chapter.slots.forEach((slot, idx) => {
            const t = slot(rng);
            const where = `${chapter.id} slot ${idx} seed ${seed}`;
            const txt = JSON.stringify(t);
            expect(txt, where).not.toMatch(/NaN|undefined|Infinity/);
            expect(t.points, where).toBeGreaterThan(0);
            expect(t.prompt.length, where).toBeGreaterThan(0);
            expect(t.solution.length, where).toBeGreaterThan(0);
            if (t.kind === "closed") {
              expect(new Set(t.choices).size, where).toBe(4);
              expect(t.correctIndex, where).toBeGreaterThanOrEqual(0);
              expect(t.correctIndex, where).toBeLessThan(4);
            } else if (t.kind === "tf") {
              expect(t.points, where).toBe(t.statements.length);
            } else {
              expect(t.key.length, where).toBeGreaterThan(0);
              const sum = t.scheme.reduce((s, x) => s + x.points, 0);
              expect(sum, where).toBe(t.points);
            }
            if (t.figure) expect(figureLabels(t.figure).length).toBeGreaterThan(0);
          });
        }
      });

      it("buduje arkusz dla grup A i B", () => {
        for (const group of ["A", "B"] as const) {
          const sheet = buildSheet({ chapterId: chapter.id, group, seed: 42 });
          expect(sheet).not.toBeNull();
          expect(sheet!.tasks).toHaveLength(chapter.slots.length);
          expect(sheet!.maxPoints).toBe(
            sheet!.tasks.reduce((s, t) => s + t.points, 0),
          );
          sheet!.tasks.forEach((t, i) => expect(t.number).toBe(i + 1));
          expect(textOf(sheet!.tasks[0])).not.toMatch(/NaN|undefined/);
        }
      });
    });
  }

  it("grupy A i B mają różne liczby", () => {
    const a = buildSheet({ chapterId: SHEET_CHAPTERS[0].id, group: "A", seed: 7 })!;
    const b = buildSheet({ chapterId: SHEET_CHAPTERS[0].id, group: "B", seed: 7 })!;
    expect(JSON.stringify(a.tasks)).not.toBe(JSON.stringify(b.tasks));
  });
});

describe("sprawdziany – skala ocen", () => {
  it("przypisuje oceny wg progów 30/50/70/86/96%", () => {
    expect(gradeForPoints(100, 100).value).toBe(6);
    expect(gradeForPoints(96, 100).value).toBe(6);
    expect(gradeForPoints(86, 100).value).toBe(5);
    expect(gradeForPoints(70, 100).value).toBe(4);
    expect(gradeForPoints(50, 100).value).toBe(3);
    expect(gradeForPoints(30, 100).value).toBe(2);
    expect(gradeForPoints(29, 100).value).toBe(1);
    expect(gradeTable(24)[0].minPoints).toBe(0);
  });
});
