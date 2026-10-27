/**
 * Krzywa XP → poziom.
 *
 * Poziom 2 ma być łatwy (~100 XP), a każde kolejne przejście droższe.
 * Wzór na XP z poziomu `level` → `level+1`:
 *   round(BASE * GROWTH^(level - 1))
 *
 * Przy BASE=100, GROWTH=1.32 (dobrane pod realne konta):
 *   1→2: 100 XP
 *   ~320 XP → poziom 3
 *   ~8400 XP → poziom 12
 */

export const XP_LEVEL_BASE = 100;
export const XP_LEVEL_GROWTH = 1.32;

/** XP wymagane, żeby przejść z `level` na `level + 1` (level ≥ 1). */
export function xpToAdvanceFrom(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.max(
    1,
    Math.round(XP_LEVEL_BASE * XP_LEVEL_GROWTH ** (safeLevel - 1)),
  );
}

/**
 * Minimalne łączne XP, żeby osiągnąć dany poziom (poziom 1 = 0 XP).
 * cumulativeXpForLevel(3) = xpToAdvanceFrom(1) + xpToAdvanceFrom(2).
 */
export function cumulativeXpForLevel(level: number): number {
  const target = Math.max(1, Math.floor(level));
  if (target <= 1) return 0;
  let total = 0;
  for (let lvl = 1; lvl < target; lvl += 1) {
    total += xpToAdvanceFrom(lvl);
  }
  return total;
}

export function calculateLevel(totalXp: number): number {
  const xp = Math.max(0, totalXp);
  let level = 1;
  let spent = 0;
  // Górny limit chroni przed nieskończoną pętlą przy ekstremalnym XP.
  while (level < 10_000) {
    const need = xpToAdvanceFrom(level);
    if (spent + need > xp) break;
    spent += need;
    level += 1;
  }
  return level;
}

export function calculateXpProgress(totalXp: number): {
  currentLevelXp: number;
  xpForNextLevel: number;
} {
  const xp = Math.max(0, totalXp);
  const level = calculateLevel(xp);
  const floorXp = cumulativeXpForLevel(level);
  const xpForNextLevel = xpToAdvanceFrom(level);
  return {
    currentLevelXp: xp - floorXp,
    xpForNextLevel,
  };
}
