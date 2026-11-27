import { formatCompactXp } from "@/lib/format/compact-number";
import type { LeaderboardEntry, LeaderboardTab } from "@/lib/supabase/leaderboard";

export const HOME_RANKING_LIMIT = 5;

export const HOME_RANKING_TABS: readonly {
  id: LeaderboardTab;
  label: string;
}[] = [
  { id: "all", label: "Wszyscy" },
  { id: "minigry", label: "Minigry" },
  { id: "pojedynki", label: "Pojedynki" },
];

export function homeRankingSortLabel(tab: LeaderboardTab): string {
  if (tab === "minigry") return "XP z minigier";
  if (tab === "pojedynki") return "rating pojedynków";
  return "łączne XP";
}

export function formatHomeRankingScore(
  tab: LeaderboardTab,
  score: number,
): string {
  if (tab === "pojedynki") {
    return `${new Intl.NumberFormat("pl-PL").format(score)} rating`;
  }
  return formatCompactXp(score);
}

export function homeRankingEmptyCopy(tab: LeaderboardTab): {
  title: string;
  actionHref: string;
  actionLabel: string;
} {
  if (tab === "minigry") {
    return {
      title: "Nikt jeszcze nie ma XP z minigier.",
      actionHref: "/minigry",
      actionLabel: "Zagraj w minigrę",
    };
  }
  if (tab === "pojedynki") {
    return {
      title: "Nikt jeszcze nie ma ratingu z pojedynków.",
      actionHref: "/pojedynki",
      actionLabel: "Rozegraj pojedynek",
    };
  }
  return {
    title: "Ranking jest jeszcze pusty.",
    actionHref: "/trening",
    actionLabel: "Zacznij trening",
  };
}

/**
 * Miejsca 2, 1, 3 - kolejność wizualna podium.
 * `null` zostawia pustą kolumnę, żeby lider stał na środku także przy 1–2 osobach.
 */
export function homeRankingPodium(
  entries: readonly LeaderboardEntry[],
): Array<LeaderboardEntry | null> {
  return [entries[1] ?? null, entries[0] ?? null, entries[2] ?? null];
}
