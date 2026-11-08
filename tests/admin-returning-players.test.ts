import { describe, expect, it } from "vitest";

import {
  computePlayerStats,
  type ProfileAnalyticsRow,
} from "@/lib/supabase/admin-analytics";

const NOW = new Date("2026-06-30T12:00:00Z");

function row(overrides: Partial<ProfileAnalyticsRow>): ProfileAnalyticsRow {
  return {
    xp: 0,
    minigryXp: 0,
    streak: 0,
    lastPlayedDate: null,
    createdAt: null,
    ...overrides,
  };
}

describe("computePlayerStats – powracający gracze", () => {
  it("liczy graczy ze starym kontem aktywnych w oknie", () => {
    const stats = computePlayerStats(
      [
        row({ createdAt: "2026-04-01T10:00:00Z", lastPlayedDate: "2026-06-29" }),
        row({ createdAt: "2026-06-10T10:00:00Z", lastPlayedDate: "2026-06-28" }),
      ],
      NOW,
    );
    expect(stats.returning7d).toBe(2);
    expect(stats.returning30d).toBe(1);
  });

  it("nie liczy nowych kont ani nieaktywnych", () => {
    const stats = computePlayerStats(
      [
        row({ createdAt: "2026-06-28T10:00:00Z", lastPlayedDate: "2026-06-29" }),
        row({ createdAt: "2026-01-01T10:00:00Z", lastPlayedDate: "2026-03-01" }),
        row({ createdAt: null, lastPlayedDate: "2026-06-29" }),
      ],
      NOW,
    );
    expect(stats.returning7d).toBe(0);
    expect(stats.returning30d).toBe(0);
  });
});
