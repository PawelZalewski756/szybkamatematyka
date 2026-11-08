import { describe, expect, it } from "vitest";

import {
  isCountablePath,
  isValidCountedPath,
  sumViews,
} from "@/lib/analytics/visit-counter";

describe("visit-counter", () => {
  it("waliduje ścieżki", () => {
    expect(isValidCountedPath("/trening")).toBe(true);
    expect(isValidCountedPath("//evil.com")).toBe(false);
    expect(isValidCountedPath("/a?b=1")).toBe(false);
    expect(isValidCountedPath("trening")).toBe(false);
    expect(isValidCountedPath(42)).toBe(false);
  });

  it("pomija admina i API", () => {
    expect(isCountablePath("/admin/analityka")).toBe(false);
    expect(isCountablePath("/api/x")).toBe(false);
    expect(isCountablePath("/trening")).toBe(true);
  });

  it("sumuje okno dni", () => {
    const rows = [
      { day: "2026-06-30", views: 5 },
      { day: "2026-06-25", views: 3 },
      { day: "2026-06-01", views: 9 },
    ];
    const today = new Date("2026-06-30T12:00:00Z");
    expect(sumViews(rows, 1, today)).toBe(5);
    expect(sumViews(rows, 7, today)).toBe(8);
    expect(sumViews(rows, 30, today)).toBe(17);
  });
});
