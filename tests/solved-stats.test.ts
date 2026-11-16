import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dateKeyInTimeZone,
  shiftDateKey,
  todayDateKey,
} from "@/lib/format/date";
import {
  emptySolvedStats,
  fetchSolvedStats,
  solvedCountFor,
  summarizeSolvedTasks,
} from "@/lib/supabase/solved-stats";

const NOW = new Date("2026-11-16T12:00:00.000Z");

function isoDaysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("daty w polskiej strefie", () => {
  it("po północy czasu polskiego nie cofa daty do wczoraj (UTC)", () => {
    // 23:30 UTC = 00:30 następnego dnia w Polsce (czas zimowy, UTC+1).
    expect(dateKeyInTimeZone(new Date("2026-11-16T23:30:00.000Z"))).toBe(
      "2026-11-17",
    );
  });

  it("przesuwa klucz daty o dni w obie strony", () => {
    expect(shiftDateKey("2026-11-01", -1)).toBe("2026-10-31");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("dzisiejszy klucz ma format YYYY-MM-DD", () => {
    expect(todayDateKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("summarizeSolvedTasks", () => {
  it("pusty zbiór daje zera i pełne okno dni", () => {
    const stats = summarizeSolvedTasks([], NOW);
    expect(stats.total).toBe(0);
    expect(stats.last7).toBe(0);
    expect(stats.last30).toBe(0);
    expect(stats.students).toBe(0);
    expect(stats.daily).toHaveLength(30);
    expect(stats.daily[stats.daily.length - 1]?.date).toBe("2026-11-16");
    expect(emptySolvedStats().total).toBe(0);
  });

  it("liczy sumy w oknach 7/30 dni i uczniów", () => {
    const stats = summarizeSolvedTasks(
      [
        { user_id: "a", solved_at: isoDaysAgo(1) },
        { user_id: "a", solved_at: isoDaysAgo(3) },
        { user_id: "b", solved_at: isoDaysAgo(10) },
        { user_id: "b", solved_at: isoDaysAgo(40) },
      ],
      NOW,
    );

    expect(stats.total).toBe(4);
    expect(stats.last7).toBe(2);
    expect(stats.last30).toBe(3);
    expect(stats.students).toBe(2);
    expect(stats.perUser.get("a")).toBe(2);
    expect(solvedCountFor(stats, "b")).toBe(2);
    expect(solvedCountFor(stats, "nie-ma")).toBe(0);
  });

  it("pomija wiersze bez user_id i z nieczytelną datą", () => {
    const stats = summarizeSolvedTasks(
      [
        { user_id: "", solved_at: isoDaysAgo(1) },
        { user_id: "a", solved_at: "nie-data" },
      ],
      NOW,
    );
    expect(stats.total).toBe(1);
    expect(stats.students).toBe(1);
    expect(stats.daily.reduce((sum, day) => sum + day.count, 0)).toBe(0);
  });

  it("dzienna seria obejmuje tylko ostatnie 30 dni", () => {
    const stats = summarizeSolvedTasks(
      [
        { user_id: "a", solved_at: isoDaysAgo(0) },
        { user_id: "a", solved_at: isoDaysAgo(29) },
        { user_id: "a", solved_at: isoDaysAgo(31) },
      ],
      NOW,
    );
    expect(stats.daily.reduce((sum, day) => sum + day.count, 0)).toBe(2);
  });
});

/** Minimalny stub klienta Supabase - zwraca podane wiersze dla każdej strony. */
function makeClient(
  rows: { user_id: string; solved_at?: string }[],
  options: { failWhenSelectingTimestamp?: boolean } = {},
): SupabaseClient {
  const builder = {
    order: () => builder,
    range: () => builder,
    in: () => builder,
    then: (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => {
      const wantsTimestamp = builder.__columns.includes("solved_at");
      const error =
        options.failWhenSelectingTimestamp && wantsTimestamp
          ? {
              code: "42703",
              message: 'column "solved_at" does not exist',
            }
          : null;
      return Promise.resolve({
        data: error ? null : rows,
        error,
      }).then(resolve, reject);
    },
    __columns: "",
  };

  return {
    from: () => ({
      select: (columns: string) => {
        builder.__columns = columns;
        return builder;
      },
    }),
  } as unknown as SupabaseClient;
}

describe("fetchSolvedStats", () => {
  it("pokazuje jawne 0 dla uczniów bez rozwiązań (bez „?”)", async () => {
    const client = makeClient([{ user_id: "a", solved_at: isoDaysAgo(1) }]);
    const stats = await fetchSolvedStats(client, {
      userIds: ["a", "b"],
      now: NOW,
    });
    expect(stats.total).toBe(1);
    expect(stats.perUser.get("a")).toBe(1);
    expect(stats.perUser.get("b")).toBe(0);
  });

  it("działa, gdy w bazie brakuje kolumny solved_at", async () => {
    const client = makeClient(
      [{ user_id: "a" }, { user_id: "a" }, { user_id: "b" }],
      { failWhenSelectingTimestamp: true },
    );
    const stats = await fetchSolvedStats(client, { now: NOW });
    expect(stats.total).toBe(3);
    expect(stats.students).toBe(2);
    // Bez daty nie da się policzyć okien czasowych.
    expect(stats.last7).toBe(0);
  });
});
