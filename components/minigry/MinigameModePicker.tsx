"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  groupMinigames,
} from "@/components/minigry/minigame-groups";
import { MINIGAME_GROUP_ICONS } from "@/components/minigry/minigame-group-icons";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  getModeConfig,
  modeDescription,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { Calculator, type LucideIcon } from "lucide-react";
import {
  MINIGAME_MODE_GLOW,
  MINIGAME_MODE_HEADER_CLASS,
} from "@/lib/minigry/minigame-themes";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import Link from "next/link";

function GamePickCard({
  game,
  mode,
  Icon,
}: {
  game: MinigameEntry;
  mode: MinigamePlayMode;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={`/minigry/${game.id}?mode=${mode}`}
      className="card-raised group flex min-h-[160px] flex-col justify-between p-5 sm:min-h-[180px]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
      </span>
      <motion.div>
        <h3 className="text-base font-bold text-foreground">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{game.description}</p>
      </motion.div>
    </Link>
  );
}

export function MinigameModePicker({ mode }: { mode: MinigamePlayMode }) {
  const { path } = useLearningPath();
  const config = getModeConfig(mode);
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);
  const games = [...recommended, ...other];
  const iconByGameId = new Map<string, LucideIcon>();
  for (const group of groupMinigames(games)) {
    const Icon = MINIGAME_GROUP_ICONS[group.visual.icon];
    for (const game of group.games) iconByGameId.set(game.id, Icon);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container flex w-full flex-1 flex-col py-8 sm:py-12"
    >
      <Link
        href="/minigry"
        className="text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        ← Minigry
      </Link>

      <header className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative ${MINIGAME_MODE_HEADER_CLASS}`}
        >
          <span
            className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-60 ${MINIGAME_MODE_GLOW}`}
            aria-hidden
          />
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            {config.badge}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {config.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            {modeDescription(mode)}
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">
            Wybierz minigrę poniżej.
          </p>
        </motion.div>
      </header>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-foreground">
          Gry dla ścieżki{" "}
          <span className="text-accent">{pathLabel}</span>
        </h2>
        {games.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
              >
                <GamePickCard
                  game={game}
                  mode={mode}
                  Icon={iconByGameId.get(game.id) ?? Calculator}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">
            Brak minigier — zmień ścieżkę w pasku u góry.
          </p>
        )}
      </section>
    </motion.div>
  );
}
