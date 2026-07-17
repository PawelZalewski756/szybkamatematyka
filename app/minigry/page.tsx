"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import { MINIGAME_MODES } from "@/lib/minigry/game-modes";
import { MINIGAME_MODE_GLOW } from "@/lib/minigry/minigame-themes";
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
      className="card-raised group relative flex min-h-[180px] flex-col justify-between p-5 sm:min-h-[200px] sm:p-6"
    >
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-40 ${MINIGAME_MODE_GLOW}`}
        aria-hidden
      />
      <span className="relative z-10 w-fit rounded-full border border-surface-border bg-surface-hover px-2.5 py-0.5 text-xs font-semibold text-muted">
        {mode.badge}
      </span>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {mode.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {mode.description}
        </p>
        <p className="mt-4 text-sm font-semibold text-accent">
          Wybierz minigrę →
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
      href={`/minigry/${game.id}?mode=time_attack`}
      className="card-raised group relative flex min-h-[140px] flex-col justify-between p-4 sm:min-h-[150px] sm:p-5"
    >
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
          {badge}
        </span>
      ) : null}
      <span
        className="text-2xl font-semibold tabular-nums text-accent"
        aria-hidden
      >
        {game.emoji}
      </span>
      <div>
        <h3 className="text-base font-bold text-foreground">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{game.description}</p>
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Minigry ·{" "}
          <span className="text-gradient-brand">{pathLabel}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Najpierw wybierz tryb (na czas, przetrwanie albo maraton), potem
          konkretną minigrę. Krótkie rundy — szybkie liczenie.
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-8 h-24 animate-pulse rounded-2xl bg-surface" />
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
            <p className="mt-2 text-sm text-muted">
              <Link href="/login" className="font-semibold text-accent">
                Zaloguj się
              </Link>{" "}
              — progres w chmurze na każdym urządzeniu.
            </p>
          )}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-base font-semibold text-foreground">1. Wybierz tryb</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {MINIGAME_MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
            >
              <ModeHubCard mode={mode} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold text-foreground">
          2. Polecane minigry ({pathLabel})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Klik otwiera grę w trybie „Na czas”. Inny tryb wybierz wyżej.
        </p>
        {recommended.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommended.map((game) => (
              <MinigameCard key={game.id} game={game} badge="Dla Ciebie" />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted">
            Brak minigier — wybierz inną ścieżkę w pasku u góry.
          </p>
        )}
      </section>

      {other.length > 0 && (
        <section className="mt-12">
          <h2 className="text-base font-semibold text-muted">Inne minigry</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {other.map((game) => (
              <MinigameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
