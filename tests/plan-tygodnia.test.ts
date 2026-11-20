import { describe, expect, it } from "vitest";

import { buildWeeklyPlan, getWeekStartKey } from "@/lib/plan-tygodnia/plan";

const NOW = new Date(2026, 10, 20, 12, 0, 0, 0); // piątek 20.11.2026

function basePlan(overrides: Partial<Parameters<typeof buildWeeklyPlan>[0]> = {}) {
  return buildWeeklyPlan({
    schoolClass: "klasa-8",
    examDate: "2027-05-05",
    now: NOW,
    dueReviewCount: 12,
    weakestCategory: "Geometria",
    completedTaskIds: [],
    ...overrides,
  });
}

describe("plan tygodnia", () => {
  it("zaczyna tydzień w poniedziałek i kończy w niedzielę", () => {
    const plan = basePlan();

    expect(plan.weekStart).toBe("2026-11-16");
    expect(plan.days).toHaveLength(7);
    expect(plan.days[0]?.dateKey).toBe("2026-11-16");
    expect(plan.days[6]?.dateKey).toBe("2026-11-22");
    expect(plan.days[0]?.weekday).toBe("Pon");
    expect(plan.days[6]?.weekday).toBe("Ndz");
  });

  it("oznacza dzisiejszy dzień i daje 2–3 zadania w dni robocze", () => {
    const plan = basePlan();

    expect(plan.today?.dateKey).toBe("2026-11-20");
    expect(plan.today?.isToday).toBe(true);
    expect(plan.days[0]?.tasks).toHaveLength(3);
    expect(plan.days[1]?.tasks).toHaveLength(2);
    expect(plan.days[6]?.isRest).toBe(true);
  });

  it("układa plan z prawdziwych tematów przypisanych do klasy", () => {
    const plan = basePlan();
    const topicTasks = plan.days
      .flatMap((day) => day.tasks)
      .filter((task) => task.kind === "topic");

    expect(topicTasks.length).toBeGreaterThan(4);
    for (const task of topicTasks) {
      expect(task.href).toMatch(/^\/trening\//);
      expect(task.title).toMatch(/^Temat: /);
    }
  });

  it("pokazuje liczbę zaległych powtórek w zadaniu", () => {
    const plan = basePlan();
    const reviewTasks = plan.days
      .flatMap((day) => day.tasks)
      .filter((task) => task.kind === "review");

    expect(reviewTasks.length).toBeGreaterThan(0);
    expect(reviewTasks[0]?.title).toContain("12 zadań");
    expect(reviewTasks[0]?.href).toBe("/powtorki");
  });

  it("jest deterministyczny dla tej samej klasy i tygodnia", () => {
    const first = basePlan();
    const second = basePlan();

    expect(
      first.days.map((day) => day.tasks.map((task) => task.id)),
    ).toEqual(second.days.map((day) => day.tasks.map((task) => task.id)));
  });

  it("zapisuje postęp tylko dla przekazanych zadań", () => {
    const initial = basePlan();
    const mondayReview = initial.days[0]?.tasks.find(
      (task) => task.kind === "review",
    );

    expect(mondayReview).toBeDefined();

    const plan = basePlan({
      completedTaskIds: mondayReview ? [mondayReview.id] : [],
    });

    expect(plan.completedTasks).toBe(1);
    expect(plan.days[0]?.completedCount).toBe(1);
    expect(plan.days[0]?.completed).toBe(false);
  });

  it("dla klas 1–3 nie wymyśla tematów, ale zostawia resztę planu", () => {
    const plan = basePlan({ schoolClass: "klasa-1" });

    expect(plan.hasClassPlan).toBe(false);
    expect(
      plan.days.flatMap((day) => day.tasks).some((task) => task.kind === "topic"),
    ).toBe(false);
    expect(plan.totalTasks).toBeGreaterThan(0);
  });

  it("przed egzaminem nie robi dnia przerwy w niedzielę", () => {
    const plan = basePlan({ examDate: "2026-11-25" });

    expect(plan.days[6]?.isRest).toBe(false);
    expect(
      plan.days[6]?.tasks.some((task) => task.kind === "review"),
    ).toBe(true);
  });

  it("ignoruje niepoprawną datę egzaminu", () => {
    const plan = basePlan({ examDate: "2026-02-31" });

    expect(plan.examDate).toBeNull();
    expect(plan.daysUntilExam).toBeNull();
  });

  it("getWeekStartKey zwraca poniedziałek dla każdego dnia tygodnia", () => {
    for (let day = 16; day <= 22; day += 1) {
      expect(getWeekStartKey(new Date(2026, 10, day, 12))).toBe("2026-11-16");
    }
  });

  it("plan ma sensowny budżet czasu", () => {
    const plan = basePlan();

    expect(plan.totalMinutes).toBeGreaterThan(60);
    expect(plan.totalMinutes).toBeLessThan(300);
  });
});
