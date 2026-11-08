import { describe, it, expect } from "vitest";
import {
  createReviewItem,
  gradeReviewItem,
  isDue,
  MIN_EASINESS,
  DEFAULT_EASINESS,
  FIRST_INTERVAL_DAYS,
  SECOND_INTERVAL_DAYS,
  WRONG_RETRY_MINUTES,
} from "@/lib/powtorki/scheduler";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

describe("createReviewItem", () => {
  it("tworzy świeży element z domyślnymi wartościami SM-2", () => {
    const item = createReviewItem("task-1", NOW);
    expect(item).toEqual({
      taskId: "task-1",
      repetitions: 0,
      intervalDays: 0,
      easiness: DEFAULT_EASINESS,
      nextReviewAt: NOW,
      lastResult: null,
      lastReviewedAt: null,
      addedAt: NOW,
    });
  });

  it("świeży element jest natychmiast wymagalny (isDue)", () => {
    const item = createReviewItem("task-1", NOW);
    expect(isDue(item, NOW)).toBe(true);
  });
});

describe("gradeReviewItem - poprawna odpowiedź", () => {
  it("pierwsza poprawna → interwał 1 dzień i wzrost EF", () => {
    const item = createReviewItem("t", NOW);
    const graded = gradeReviewItem(item, true, NOW);

    expect(graded.repetitions).toBe(1);
    expect(graded.intervalDays).toBe(FIRST_INTERVAL_DAYS);
    expect(graded.lastResult).toBe("correct");
    expect(graded.lastReviewedAt).toBe(NOW);
    expect(graded.nextReviewAt).toBe(NOW + FIRST_INTERVAL_DAYS * DAY_MS);
    // q=5 → EF rośnie o 0.1
    expect(graded.easiness).toBeGreaterThan(DEFAULT_EASINESS);
  });

  it("druga poprawna → interwał 3 dni", () => {
    const item = createReviewItem("t", NOW);
    const first = gradeReviewItem(item, true, NOW);
    const second = gradeReviewItem(first, true, NOW);

    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(SECOND_INTERVAL_DAYS);
    expect(second.nextReviewAt).toBe(NOW + SECOND_INTERVAL_DAYS * DAY_MS);
  });

  it("trzecia+ poprawna → interwał = round(poprzedni * EF) i rośnie", () => {
    const item = createReviewItem("t", NOW);
    const a = gradeReviewItem(item, true, NOW);
    const b = gradeReviewItem(a, true, NOW);
    const c = gradeReviewItem(b, true, NOW);

    const expected = Math.max(1, Math.round(b.intervalDays * c.easiness));
    expect(c.repetitions).toBe(3);
    expect(c.intervalDays).toBe(expected);
    // przy rosnącym EF interwał wydłuża się względem poprzedniego
    expect(c.intervalDays).toBeGreaterThan(b.intervalDays);
  });

  it("kolejne poprawne odpowiedzi nieprzerwanie wydłużają interwał", () => {
    let item = createReviewItem("t", NOW);
    let prevInterval = 0;
    for (let i = 0; i < 6; i++) {
      item = gradeReviewItem(item, true, NOW);
      expect(item.intervalDays).toBeGreaterThanOrEqual(prevInterval);
      prevInterval = item.intervalDays;
    }
  });
});

describe("gradeReviewItem - błędna odpowiedź", () => {
  it("resetuje powtórki i ustawia krótki interwał (minuty)", () => {
    const item = createReviewItem("t", NOW);
    const ok = gradeReviewItem(item, true, NOW);
    const okok = gradeReviewItem(ok, true, NOW);

    const wrong = gradeReviewItem(okok, false, NOW);
    expect(wrong.repetitions).toBe(0);
    expect(wrong.intervalDays).toBe(0);
    expect(wrong.lastResult).toBe("wrong");
    expect(wrong.nextReviewAt).toBe(NOW + WRONG_RETRY_MINUTES * 60 * 1000);
    // krótki retry mieści się w obrębie tego samego dnia
    expect(wrong.nextReviewAt - NOW).toBeLessThan(DAY_MS);
  });

  it("EF maleje po błędzie, ale nigdy poniżej MIN_EASINESS (1.3)", () => {
    let item = createReviewItem("t", NOW);
    const firstWrong = gradeReviewItem(item, false, NOW);
    expect(firstWrong.easiness).toBeLessThan(DEFAULT_EASINESS);

    // wiele błędów z rzędu - EF nie spada poniżej progu
    item = createReviewItem("t2", NOW);
    for (let i = 0; i < 20; i++) {
      item = gradeReviewItem(item, false, NOW);
      expect(item.easiness).toBeGreaterThanOrEqual(MIN_EASINESS);
    }
    expect(item.easiness).toBe(MIN_EASINESS);
  });
});

describe("isDue", () => {
  it("true gdy nextReviewAt <= now, false gdy w przyszłości", () => {
    const item = createReviewItem("t", NOW);
    const graded = gradeReviewItem(item, true, NOW);
    expect(isDue(graded, NOW)).toBe(false);
    expect(isDue(graded, graded.nextReviewAt)).toBe(true);
    expect(isDue(graded, graded.nextReviewAt + 1)).toBe(true);
  });
});
