export function formatCompactXp(xp: number): string {
  return (
    new Intl.NumberFormat("pl-PL", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(xp) + " XP"
  );
}
