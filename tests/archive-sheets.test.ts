import { describe, expect, it } from "vitest";
import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
  listOfficialCkeSheets,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { EXAM_ARCHIVE_TASKS } from "@/lib/baza-zadan/exams/cke-archive.generated";
import { officialCkeSheetHref, officialCkeSheetKind } from "@/lib/baza-zadan/exams/archive-sheet-meta";

describe("listOfficialCkeSheets", () => {
  it("zwraca oficjalne sesje matury z archiwum, najnowsze pierwsze", () => {
    const sheets = listOfficialCkeSheets();
    expect(sheets.length).toBeGreaterThanOrEqual(18);
    expect(sheets.every((sheet) => sheet.taskIds.length > 0)).toBe(true);
    expect(sheets[0]?.year).toBeGreaterThanOrEqual(sheets.at(-1)?.year ?? 0);
    expect(sheets.some((sheet) => sheet.id === "arkusz-m25-maj")).toBe(true);
  });
});

describe("getOfficialCkeSheetTasks", () => {
  it("składa zadania sesji bez luk w identyfikatorach", () => {
    const sheet = getOfficialCkeSheetById("arkusz-m25-maj");
    expect(sheet).toBeTruthy();
    const tasks = getOfficialCkeSheetTasks("arkusz-m25-maj");
    expect(tasks).toHaveLength(sheet!.taskIds.length);
    expect(tasks[0]?.id).toBe("cke-m25-maj-z01");
  });
});

describe("EXAM_ARCHIVE_TASKS answer keys", () => {
  it("does not publish an out-of-range or implicit A key", () => {
    const multipleChoice = EXAM_ARCHIVE_TASKS.filter(
      (task) => task.choices.length > 1,
    );

    expect(multipleChoice.length).toBeGreaterThan(0);
    expect(
      multipleChoice.every(
        (task) =>
          task.correctIndex >= 0 && task.correctIndex < task.choices.length,
      ),
    ).toBe(true);
    expect(
      EXAM_ARCHIVE_TASKS.find((task) => task.id === "cke-m15-maj-z02")
        ?.correctIndex,
    ).toBe(3);
  });

  it("keeps unresolved image and composite solutions open", () => {
    expect(
      EXAM_ARCHIVE_TASKS.find((task) => task.id === "cke-m15-maj-z03")
        ?.choices,
    ).toHaveLength(1);
    expect(
      EXAM_ARCHIVE_TASKS.find((task) => task.id === "cke-m23-maj-z12")?.choices,
    ).toHaveLength(1);
  });
});

describe("officialCkeSheetHref", () => {
  it("prowadzi do kanonicznej trasy treningu", () => {
    expect(officialCkeSheetHref("arkusz-m25-maj")).toBe(
      "/trening/arkusze/arkusz-m25-maj",
    );
  });
});

describe("officialCkeSheetKind", () => {
  it("traktuje sesje matury z archiwum jako maturę", () => {
    const sheet = getOfficialCkeSheetById("arkusz-m25-maj");
    expect(sheet).toBeTruthy();
    expect(officialCkeSheetKind(sheet!)).toBe("matura");
  });
});
