"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  getModeConfig,
  modeDescription,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import Link from "next/link";

function GamePickCard({
  game,
  mode,
}: {
  game: MinigameEntry;
  mode: MinigamePlayMode;
}) {
  return (
    <Link
      href={`/minigry/${game.id}?mode=${mode}`}
      className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 sm:min-h-[180px]"
    >
      <span className="text-4xl transition-transform group-hover:scale-110">
        {game.emoji}
      </span>
      <motion.div>
        <h3 className="text-lg font-black text-white">{game.title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{game.description}</p>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-1 flex-col py-8 sm:py-12"
    >
      <Link
        href="/minigry"
        className="text-sm font-semibold text-zinc-500 transition-colors hover:text-fuchsia-400"
      >
        ← Minigry
      </Link>

      <header className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.gradient} p-6 shadow-xl sm:p-8`}
        >
          <span
            className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-60 ${config.glow}`}
            aria-hidden
          />
          <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {config.badge}
          </span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            {config.emoji} {config.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
            {modeDescription(mode)}
          </p>
        </motion.div>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-black text-white">
          Wybierz grę dla{" "}
          <span className="text-cyan-300">{pathLabel}</span>
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
                <GamePickCard game={game} mode={mode} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-zinc-500">
            Brak minigier — zmień ścieżkę w pasku u góry.
          </p>
        )}
      </section>
    </motion.div>
  );
}
