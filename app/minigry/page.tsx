"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import { MINIGAME_MODES } from "@/lib/minigry/game-modes";
import { learningPathLabel } from "@/lib/learning-path";
import { useGameAccount } from "@/lib/minigry/use-game-account";
import { motion } from "framer-motion";
import Link from "next/link";

function ModeHubCard({
  mode,
}: {
  mode: (typeof MINIGAME_MODES)[number];
}) {
  return (
    <Link
      href={`/minigry/modes/${mode.slug}`}
      className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${mode.gradient} p-6 shadow-lg backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98] sm:min-h-[260px] sm:p-8`}
    >
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-60 ${mode.glow}`}
        aria-hidden
      />
      <span className="absolute right-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
        {mode.badge}
      </span>
      <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
        {mode.emoji}
      </span>
      <div>
        <h2 className="text-2xl font-black text-white sm:text-3xl">
          {mode.title}
        </h2>
        <p className="mt-2 text-sm font-medium text-white/85 sm:text-base">
          {mode.description}
        </p>
      </div>
    </Link>
  );
}

function MinigameCard({
  game,
  badge,
}: {
  game: MinigameEntry;
  badge?: string;
}) {
  return (
    <Link
      href={game.href}
      className={`group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 sm:min-h-[180px]`}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {badge}
        </span>
      )}
      <span className="text-4xl transition-transform group-hover:scale-110">
        {game.emoji}
      </span>
      <div>
        <h3 className="text-lg font-black text-white">{game.title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{game.description}</p>
      </div>
    </Link>
  );
}

export default function MinigryPage() {
  const { path } = useLearningPath();
  const { account, loading, displayProgress } = useGameAccount();
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);

  return (
    <div className="page-container flex w-full flex-1 flex-col py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
          Minigry dla{" "}
          <span className="text-gradient-brand">
            {pathLabel}
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-400">
          Wybierz tryb gry — Time Attack, Survival lub Marathon — a potem
          minigrę dopasowaną do Twojej ścieżki.
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-8 h-24 animate-pulse rounded-2xl bg-zinc-900" />
      ) : (
        <div className="mt-8 max-w-xl">
          <AccountLevelBar
            level={displayProgress.level}
            xp={displayProgress.xp}
            subtitle={
              account?.isLoggedIn && account.profile
                ? account.profile.nick
                : "Zaloguj się, by zapisywać XP"
            }
          />
          {!account?.isLoggedIn && (
            <p className="mt-2 text-sm text-zinc-500">
              <Link href="/login" className="font-semibold text-orange-400">
                Zaloguj się
              </Link>{" "}
              — progres w chmurze na każdym urządzeniu.
            </p>
          )}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-black text-white sm:text-xl">Tryby gry</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {MINIGAME_MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <ModeHubCard mode={mode} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-black text-white sm:text-xl">
          Polecane dla {pathLabel}
        </h2>
        {recommended.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommended.map((game) => (
              <MinigameCard key={game.id} game={game} badge="Dla Ciebie" />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-zinc-500">
            Brak minigier — wybierz inną ścieżkę w pasku u góry.
          </p>
        )}
      </section>

      {other.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-black text-zinc-400 sm:text-xl">
            Inne minigry
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {other.map((game) => (
              <MinigameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
