"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { groupMinigames } from "@/components/minigry/minigame-groups";
import { MINIGAME_GROUP_ICONS } from "@/components/minigry/minigame-group-icons";
import {
  MinigameGlyph,
  getGameVisual,
  type GameVisual,
} from "@/components/minigry/minigame-visuals";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  getModeConfig,
  modeDescription,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { MINIGAME_MODE_HEADER_CLASS } from "@/lib/minigry/minigame-themes";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function GamePickCard({
  game,
  mode,
  visual,
}: {
  game: MinigameEntry;
  mode: MinigamePlayMode;
  visual: GameVisual;
}) {
  return (
    <Link
      href={`/minigry/${game.id}?mode=${mode}`}
      className="card-raised group flex min-h-[170px] flex-col justify-between gap-4 p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-accent/45"
    >
      <span className="flex items-start justify-between gap-3">
        <MinigameGlyph visual={visual} size="card" />
        <ArrowRight
          className="mt-1 h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
          aria-hidden
        />
      </span>
      <span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          {visual.label}
        </span>
        <span className="mt-1 block text-base font-bold text-foreground">
          {game.title}
        </span>
        <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-muted">
          {game.description}
        </span>
      </span>
    </Link>
  );
}

export function MinigameModePicker({ mode }: { mode: MinigamePlayMode }) {
  const { path } = useLearningPath();
  const config = getModeConfig(mode);
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);
  const recommendedGroups = groupMinigames(recommended);
  const otherGroups = groupMinigames(other);

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
          Gry dla ścieżki <span className="text-accent">{pathLabel}</span>
        </h2>

        {recommendedGroups.length > 0 ? (
          <div className="mt-5 space-y-8">
            {recommendedGroups.map((group) => {
              const GroupIcon = MINIGAME_GROUP_ICONS[group.visual.icon];
              return (
                <section key={group.id}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                      <GroupIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {group.title}
                    </h3>
                    <span className="text-xs text-muted">
                      {group.games.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{group.description}</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.games.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 * index }}
                      >
                        <GamePickCard
                          game={game}
                          mode={mode}
                          visual={getGameVisual(game)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-muted">
            Brak minigier - zmień ścieżkę w pasku u góry.
          </p>
        )}

        {otherGroups.length > 0 ? (
          <details className="mt-8 border-y border-surface-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:content-none">
              <span className="text-sm font-semibold text-foreground">
                Gry dla innych ścieżek
              </span>
              <span className="text-xs text-muted">{other.length} gier</span>
            </summary>
            <div className="space-y-6 border-t border-surface-border p-4">
              {otherGroups.map((group) => (
                <section key={group.id}>
                  <h3 className="text-sm font-bold text-foreground">
                    {group.title}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.games.map((game) => (
                      <GamePickCard
                        key={game.id}
                        game={game}
                        mode={mode}
                        visual={getGameVisual(game)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        ) : null}
      </section>
    </motion.div>
  );
}
