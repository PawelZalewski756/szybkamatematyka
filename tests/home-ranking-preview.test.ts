import { describe, expect, it } from "vitest";

import {
  formatHomeRankingScore,
  homeRankingEmptyCopy,
  homeRankingPodium,
  homeRankingSortLabel,
} from "@/lib/home/ranking-preview";
import type { LeaderboardEntry } from "@/lib/supabase/leaderboard";

function entry(rank: number, nick: string): LeaderboardEntry {
  return {
    rank,
    id: `id-${rank}`,
    nick,
    xp: rank * 100,
    level: rank,
    avatarUrl: null,
  };
}

describe("home ranking preview", () => {
  it("opisuje kategorię bez sezonu tygodniowego", () => {
    expect(homeRankingSortLabel("all")).toBe("łączne XP");
    expect(homeRankingSortLabel("minigry")).toBe("XP z minigier");
    expect(homeRankingSortLabel("pojedynki")).toBe("rating pojedynków");
  });

  it("rating pojedynków nie dostaje sufiksu XP", () => {
    const duel = formatHomeRankingScore("pojedynki", 1250);
    expect(duel.replace(/\s/g, "")).toBe("1250rating");
    expect(duel.endsWith("rating")).toBe(true);
    expect(duel).not.toContain("XP");
    const xp = formatHomeRankingScore("all", 18420);
    expect(xp).toContain("XP");
    expect(xp).not.toContain("rating");
  });

  it("pusty ranking prowadzi do właściwej aktywności", () => {
    expect(homeRankingEmptyCopy("all").actionHref).toBe("/trening");
    expect(homeRankingEmptyCopy("minigry").actionHref).toBe("/minigry");
    expect(homeRankingEmptyCopy("pojedynki").actionHref).toBe("/pojedynki");
  });

  it("układa podium 2-1-3 i zostawia puste kolumny", () => {
    const one = homeRankingPodium([entry(1, "Ala")]);
    expect(one.map((item) => item?.nick ?? null)).toEqual([null, "Ala", null]);

    const two = homeRankingPodium([entry(1, "Ala"), entry(2, "Bartek")]);
    expect(two.map((item) => item?.nick ?? null)).toEqual([
      "Bartek",
      "Ala",
      null,
    ]);

    const three = homeRankingPodium([
      entry(1, "Ala"),
      entry(2, "Bartek"),
      entry(3, "Celina"),
    ]);
    expect(three.map((item) => item?.nick ?? null)).toEqual([
      "Bartek",
      "Ala",
      "Celina",
    ]);
  });
});