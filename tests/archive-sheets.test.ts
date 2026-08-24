import { describe, expect, it } from "vitest";
import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
  listOfficialCkeSheets,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { officialCkeSheetHref } from "@/lib/baza-zadan/exams/archive-sheet-meta";

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

describe("officialCkeSheetHref", () => {
  it("prowadzi do kanonicznej trasy treningu", () => {
    expect(officialCkeSheetHref("arkusz-m25-maj")).toBe(
      "/trening/arkusze/arkusz-m25-maj",
    );
  });
});
