export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / 500) + 1;
}

export function calculateXpProgress(totalXp: number): {
  currentLevelXp: number;
  xpForNextLevel: number;
} {
  const xp = Math.max(0, totalXp);
  return {
    currentLevelXp: xp % 500,
    xpForNextLevel: 500,
  };
}
