"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { groupMinigames } from "@/components/minigry/minigame-groups";
import { MINIGAME_GROUP_ICONS } from "@/components/minigry/minigame-group-icons";
import {
  MinigameGlyph,
  VISUAL_TONES,
  getGameVisual,
} from "@/components/minigry/minigame-visuals";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  getModeConfig,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { MINIGAME_MODE_HEADER_CLASS } from "@/lib/minigry/minigame-themes";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function gameCountLabel(count: number): string {
  if (count === 1) return "1 gra";
  if (count >= 2 && count <= 4) return `${count} gry`;
  return `${count} gier`;
}

function GamePickCard({
  game,
  mode,
}: {
  game: MinigameEntry;
  mode: MinigamePlayMode;
}) {
  const visual = getGameVisual(game);
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`/minigry/${game.id}?mode=${mode}`}
      className="group flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface px-3 py-2.5 transition hover:border-accent/45 hover:bg-surface-hover"
    >
      <MinigameGlyph visual={visual} size="card" />
      <span className="min-w-0 flex-1">
        <span className="block line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {game.title}
        </span>
        <span
          className={`block text-[11px] font-bold uppercase tracking-[0.12em] ${tone.text}`}
        >
          {visual.label}
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}

function GameGrid({
  games,
  mode,
}: {
  games: MinigameEntry[];
  mode: MinigamePlayMode;
}) {
  return (
    <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <GamePickCard key={game.id} game={game} mode={mode} />
      ))}
    </div>
  );
}

export function MinigameModePicker({ mode }: { mode: MinigamePlayMode }) {
  const { path } = useLearningPath();
  const config = getModeConfig(mode);
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);
  const recommendedGroups = groupMinigames(recommended);
  const otherGroups = groupMinigames(other);
  const gameCount = recommended.length + other.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container flex w-full flex-1 flex-col py-8 sm:py-10"
    >
      <Link
        href="/minigry"
        className="text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        ← Minigry
      </Link>

      <header className={`mt-5 ${MINIGAME_MODE_HEADER_CLASS}`}>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong">
          {config.badge}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {config.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">
          {config.description}
        </p>
      </header>

      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-surface-border pb-3">
          <h2 className="text-lg font-extrabold text-foreground">Wybierz grę</h2>
          <p className="text-xs text-muted">
            {gameCountLabel(gameCount)} dla: {pathLabel}
          </p>
        </div>

        {recommendedGroups.length > 0 ? (
          <div className="mt-5 space-y-6">
            {recommendedGroups.map((group) => {
              const GroupIcon = MINIGAME_GROUP_ICONS[group.visual.icon];
              const tone = VISUAL_TONES[group.visual.tone];
              return (
                <section key={group.id}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tone.panel}`}
                    >
                      <GroupIcon className={`h-4 w-4 ${tone.text}`} aria-hidden />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {group.title}
                    </h3>
                    <span className="text-xs text-muted">
                      {gameCountLabel(group.games.length)}
                    </span>
                  </div>
                  <GameGrid games={group.games} mode={mode} />
                </section>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Brak minigier - zmień ścieżkę w pasku u góry.
          </p>
        )}

        {otherGroups.length > 0 ? (
          <details className="mt-7 rounded-xl border border-surface-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3.5 marker:content-none">
              <span className="text-sm font-semibold text-foreground">
                Gry dla innych ścieżek
              </span>
              <span className="text-xs text-muted">
                {gameCountLabel(other.length)}
              </span>
            </summary>
            <div className="space-y-5 border-t border-surface-border p-3.5">
              {otherGroups.map((group) => (
                <section key={group.id}>
                  <h3 className="text-sm font-bold text-foreground">
                    {group.title}
                  </h3>
                  <GameGrid games={group.games} mode={mode} />
                </section>
              ))}
            </div>
          </details>
        ) : null}
      </section>
    </motion.div>
  );
}
