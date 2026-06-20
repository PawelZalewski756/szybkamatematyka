import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";
import {
  matchesLearningPath,
  type LearningPath,
  type PathMatcher,
} from "@/lib/learning-path";

export type MinigameEntry = {
  id: string;
  href: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  glow: string;
  available: boolean;
  forPaths: readonly PathMatcher[];
};

export const MINIGAMES_CATALOG: MinigameEntry[] = MINIGAME_REGISTRY.map(
  (game) => ({
    id: game.slug,
    href: `/minigry/${game.slug}`,
    title: game.title,
    description: game.description,
    emoji: game.emoji,
    gradient: game.gradient,
    glow: game.glow,
    available: true,
    forPaths: game.forPaths,
  }),
);

export function getMinigamesForPath(path: LearningPath) {
  const recommended = MINIGAMES_CATALOG.filter((g) =>
    matchesLearningPath(path, g.forPaths),
  );
  const other = MINIGAMES_CATALOG.filter(
    (g) => !matchesLearningPath(path, g.forPaths),
  );
  return { recommended, other };
}
