import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  ACHIEVEMENTS_TOTAL,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TIER_LABELS,
  evaluateAchievement,
  evaluateAll,
  findAchievement,
  unlockedCount,
  unlockedIds,
} from "@/lib/achievements/catalog";
import {
  behaviorFromDate,
  buildPlayerStats,
  emptyPlayerStats,
  mergeBehaviorFlags,
  mergeSeenIds,
  type BehaviorFlags,
} from "@/lib/achievements/stats";
import type { PlayerStats } from "@/lib/achievements/types";
import { calculateLevel } from "@/lib/levelSystem";

function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return { ...emptyPlayerStats(), ...overrides };
}

/** Statystyki, które powinny odblokować WSZYSTKIE odznaki z katalogu. */
const MAXED: PlayerStats = {
  xp: 20000,
  level: 41,
  streak: 30,
  minigryXp: 5000,
  minigryLevel: 11,
  solvedCount: 500,
  reviewFlaggedCount: 10,
  challengesCompleted: 30,
  challengeBestStreak: 7,
  duelChallengesCreated: 5,
  nightOwl: true,
  earlyBird: true,
  weekendWarrior: true,
};

describe("katalog osiągnięć — integralność", () => {
  it("zawiera 15–30 odznak", () => {
    expect(ACHIEVEMENTS_TOTAL).toBe(ACHIEVEMENTS.length);
    expect(ACHIEVEMENTS_TOTAL).toBeGreaterThanOrEqual(15);
    expect(ACHIEVEMENTS_TOTAL).toBeLessThanOrEqual(30);
  });

  it("wszystkie ID są unikalne", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("każda odznaka ma niepuste tytuł i opis", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.trim().length).toBeGreaterThan(0);
      expect(a.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("każda kategoria odznaki jest w CATEGORY_ORDER i ma etykietę", () => {
    for (const a of ACHIEVEMENTS) {
      expect(CATEGORY_ORDER).toContain(a.category);
      expect(CATEGORY_LABELS[a.category]).toBeTruthy();
      expect(TIER_LABELS[a.tier]).toBeTruthy();
    }
  });

  it("każda funkcja measure zwraca dodatni cel dla pustych statystyk", () => {
    const stats = emptyPlayerStats();
    for (const a of ACHIEVEMENTS) {
      const { target } = a.measure(stats);
      expect(target).toBeGreaterThan(0);
    }
  });

  it("CATEGORY_ORDER nie zawiera duplikatów", () => {
    expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length);
  });
});

describe("evaluateAchievement", () => {
  it("pusty stan gracza → 0 odblokowanych", () => {
    expect(unlockedCount(emptyPlayerStats())).toBe(0);
  });

  it("maksymalne statystyki → wszystkie odblokowane", () => {
    expect(unlockedCount(MAXED)).toBe(ACHIEVEMENTS_TOTAL);
    expect(unlockedIds(MAXED).size).toBe(ACHIEVEMENTS_TOTAL);
  });

  it("próg odblokowuje się dokładnie przy wartości docelowej", () => {
    const at49 = makeStats({ solvedCount: 49 });
    const at50 = makeStats({ solvedCount: 50 });
    const solved50 = findAchievement("solved-50")!;
    expect(evaluateAchievement(solved50, at49).unlocked).toBe(false);
    expect(evaluateAchievement(solved50, at50).unlocked).toBe(true);
  });

  it("procent jest ograniczony do zakresu 0–100", () => {
    const huge = makeStats({ solvedCount: 99999 });
    const first = findAchievement("first-task")!;
    const status = evaluateAchievement(first, huge);
    expect(status.percent).toBe(100);
    expect(status.current).toBeLessThanOrEqual(status.target);
  });

  it("częściowy postęp daje procent pomiędzy 0 a 100", () => {
    const half = makeStats({ solvedCount: 5 });
    const solved10 = findAchievement("solved-10")!;
    const status = evaluateAchievement(solved10, half);
    expect(status.unlocked).toBe(false);
    expect(status.percent).toBe(50);
    expect(status.current).toBe(5);
    expect(status.target).toBe(10);
  });

  it("odznaki boolowskie mają cel 1", () => {
    const night = findAchievement("night-owl")!;
    expect(evaluateAchievement(night, makeStats({ nightOwl: false })).unlocked).toBe(
      false,
    );
    expect(evaluateAchievement(night, makeStats({ nightOwl: true })).unlocked).toBe(
      true,
    );
  });

  it("'wszechstronny' wymaga aktywności w 3 trybach", () => {
    const allRounder = findAchievement("all-rounder")!;
    const partial = makeStats({ solvedCount: 1, challengesCompleted: 1 });
    expect(evaluateAchievement(allRounder, partial).current).toBe(2);
    expect(evaluateAchievement(allRounder, partial).unlocked).toBe(false);

    const full = makeStats({
      solvedCount: 1,
      challengesCompleted: 1,
      minigryXp: 10,
    });
    expect(evaluateAchievement(allRounder, full).unlocked).toBe(true);
  });

  it("evaluateAll zachowuje kolejność i długość katalogu", () => {
    const all = evaluateAll(MAXED);
    expect(all).toHaveLength(ACHIEVEMENTS_TOTAL);
    expect(all.map((s) => s.id)).toEqual(ACHIEVEMENTS.map((a) => a.id));
  });
});

describe("buildPlayerStats", () => {
  const emptyBehavior: BehaviorFlags = {
    nightOwl: false,
    earlyBird: false,
    weekendWarrior: false,
  };

  it("wylicza poziom konta i minigier z XP", () => {
    const stats = buildPlayerStats({
      profile: {
        id: "u1",
        nick: "test",
        xp: 1200,
        minigryXp: 600,
        level: 99,
        streak: 4,
        lastPlayedDate: null,
        avatarUrl: null,
        lastNickUpdate: null,
      },
      solvedCount: 12,
      reviewFlaggedCount: 2,
      challengesCompleted: 3,
      challengeBestStreak: 2,
      duelChallengesCreated: 1,
      behavior: emptyBehavior,
    });
    // Krzywa BASE*1.45^(n-1): 1200 XP ≈ poz. 5, 600 XP ≈ poz. 4
    expect(stats.level).toBe(calculateLevel(1200));
    expect(stats.minigryLevel).toBe(calculateLevel(600));
    expect(stats.solvedCount).toBe(12);
    expect(stats.streak).toBe(4);
  });

  it("brak profilu → zerowe wartości i poziom 1", () => {
    const stats = buildPlayerStats({
      profile: null,
      solvedCount: 0,
      reviewFlaggedCount: 0,
      challengesCompleted: 0,
      challengeBestStreak: 0,
      duelChallengesCreated: 0,
      behavior: emptyBehavior,
    });
    expect(stats.level).toBe(1);
    expect(stats.minigryLevel).toBe(1);
    expect(stats.xp).toBe(0);
  });

  it("ujemne liczniki są przycinane do 0", () => {
    const stats = buildPlayerStats({
      profile: null,
      solvedCount: -5,
      reviewFlaggedCount: -1,
      challengesCompleted: -3,
      challengeBestStreak: -2,
      duelChallengesCreated: -1,
      behavior: emptyBehavior,
    });
    expect(stats.solvedCount).toBe(0);
    expect(stats.challengesCompleted).toBe(0);
  });
});

describe("behaviorFromDate / mergeBehaviorFlags", () => {
  it("rozpoznaje noc (00:00–04:59)", () => {
    const night = behaviorFromDate(new Date("2026-05-29T02:30:00"));
    expect(night.nightOwl).toBe(true);
    expect(night.earlyBird).toBe(false);
  });

  it("rozpoznaje wczesny poranek (05:00–07:59)", () => {
    const early = behaviorFromDate(new Date("2026-05-29T06:15:00"));
    expect(early.earlyBird).toBe(true);
    expect(early.nightOwl).toBe(false);
  });

  it("rozpoznaje weekend (sobota/niedziela)", () => {
    // 2026-05-30 to sobota, 2026-05-31 niedziela, 2026-05-29 piątek
    expect(behaviorFromDate(new Date("2026-05-30T12:00:00")).weekendWarrior).toBe(
      true,
    );
    expect(behaviorFromDate(new Date("2026-05-31T12:00:00")).weekendWarrior).toBe(
      true,
    );
    expect(behaviorFromDate(new Date("2026-05-29T12:00:00")).weekendWarrior).toBe(
      false,
    );
  });

  it("merge zachowuje raz zdobyte flagi (sticky true)", () => {
    const prev: BehaviorFlags = {
      nightOwl: true,
      earlyBird: false,
      weekendWarrior: false,
    };
    const next: BehaviorFlags = {
      nightOwl: false,
      earlyBird: true,
      weekendWarrior: false,
    };
    expect(mergeBehaviorFlags(prev, next)).toEqual({
      nightOwl: true,
      earlyBird: true,
      weekendWarrior: false,
    });
  });
});

describe("mergeSeenIds", () => {
  it("tworzy unię dwóch zbiorów widzianych odznak", () => {
    const local = new Set(["first-task", "solved-10"]);
    const remote = new Set(["solved-10", "streak-3"]);
    expect([...mergeSeenIds(local, remote)].sort()).toEqual([
      "first-task",
      "solved-10",
      "streak-3",
    ]);
  });

  it("zachowuje widziane z dowolnego urządzenia (sticky)", () => {
    // Odznaka widziana tylko lokalnie i tylko w chmurze — obie pozostają.
    const local = new Set(["night-owl"]);
    const remote = new Set(["early-bird"]);
    const merged = mergeSeenIds(local, remote);
    expect(merged.has("night-owl")).toBe(true);
    expect(merged.has("early-bird")).toBe(true);
  });

  it("nie mutuje wejściowych zbiorów", () => {
    const local = new Set(["a"]);
    const remote = new Set(["b"]);
    mergeSeenIds(local, remote);
    expect([...local]).toEqual(["a"]);
    expect([...remote]).toEqual(["b"]);
  });

  it("puste zbiory dają pusty wynik", () => {
    expect(mergeSeenIds(new Set(), new Set()).size).toBe(0);
  });
});
