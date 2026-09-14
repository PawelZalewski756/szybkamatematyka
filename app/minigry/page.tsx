"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import {
  groupMinigames,
  type MinigameGroup,
} from "@/components/minigry/minigame-groups";
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

function gameCountLabel(count: number): string {
  if (count === 1) return "1 gra";
  if (count >= 2 && count <= 4) return `${count} gry`;
  return `${count} gier`;
}

function ModeHubCard({
  mode,
  recommended,
}: {
  mode: (typeof MINIGAME_MODES)[number];
  recommended: boolean;
}) {
  return (
    <Link
      href={`/minigry/modes/${mode.slug}`}
      data-testid={`minigame-mode-${mode.id}`}
      className={`card-raised group flex min-h-[148px] flex-col justify-between p-4 sm:p-5 ${
        recommended ? "border-accent/50 bg-accent-soft" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-surface-border bg-surface-hover px-2.5 py-0.5 text-xs font-semibold text-muted">
          {mode.badge}
        </span>
        {recommended ? (
          <span className="text-xs font-bold text-accent">Polecany start</span>
        ) : null}
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-bold text-foreground">{mode.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {mode.description}
        </p>
      </div>
      <span className="mt-4 text-sm font-semibold text-accent">
        Wybierz minigrę <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function RecommendedStart({
  game,
  pathLabel,
}: {
  game?: MinigameEntry;
  pathLabel: string;
}) {
  if (!game) {
    return (
      <section className="rounded-2xl border border-surface-border bg-surface p-5 sm:p-6">
        <p className="text-sm text-muted">
          Brak dostępnej minigry dla tej ścieżki. Wybierz tryb poniżej, aby
          zobaczyć pełną bibliotekę.
        </p>
      </section>
    );
  }

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-recommended-start"
      className="card-raised group flex flex-col justify-between border-accent/45 bg-accent-soft p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="icon-chip h-12 w-12 shrink-0 text-lg font-bold sm:h-14 sm:w-14">
          {game.emoji}
        </span>
        <div className="min-w-0">
          <p className="text-overline text-accent">Polecany start</p>
          <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            {game.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {game.description}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="btn-chunky px-5 py-3 text-sm">
          Zagraj teraz <span aria-hidden>→</span>
        </span>
        <span className="text-xs font-semibold text-muted">
          {pathLabel} · Na czas · 60 s
        </span>
      </div>
    </Link>
  );
}

function MinigameCard({ game }: { game: MinigameEntry }) {
  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-game-card"
      className="group flex min-h-[116px] items-start gap-3 rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-accent/45 hover:bg-surface-hover"
    >
      <span className="icon-chip h-10 w-10 shrink-0 text-base font-semibold">
        {game.emoji}
      </span>
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-foreground">{game.title}</span>
          <span
            className="shrink-0 text-sm text-muted transition-colors group-hover:text-accent"
            aria-hidden
          >
            →
          </span>
        </span>
        <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted">
          {game.description}
        </span>
      </span>
    </Link>
  );
}

function MinigameGroupDisclosure({ group }: { group: MinigameGroup }) {
  return (
    <details
      className="group rounded-xl border border-surface-border bg-background"
      data-testid={`minigame-group-${group.id}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:content-none">
        <span className="min-w-0">
          <span className="block text-sm font-bold text-foreground">
            {group.title}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            {group.description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">
          {gameCountLabel(group.games.length)}
          <span
            className="text-base transition-transform group-open:rotate-45"
            aria-hidden
          >
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-surface-border p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.games.map((game) => (
            <MinigameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </details>
  );
}

function MinigameLibraryDisclosure({
  title,
  description,
  groups,
  testId,
  open = false,
}: {
  title: string;
  description: string;
  groups: MinigameGroup[];
  testId: string;
  open?: boolean;
}) {
  const gameCount = groups.reduce((total, group) => total + group.games.length, 0);

  return (
    <details
      open={open}
      className="overflow-hidden rounded-2xl border border-surface-border bg-surface"
      data-testid={testId}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:content-none sm:px-5">
        <span className="min-w-0">
          <span className="block text-base font-bold text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-sm text-muted">{description}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-muted">
          {gameCountLabel(gameCount)}
        </span>
      </summary>
      <div className="space-y-3 border-t border-surface-border p-3 sm:p-4">
        {groups.map((group) => (
          <MinigameGroupDisclosure key={group.id} group={group} />
        ))}
      </div>
    </details>
  );
}

export default function MinigryPage() {
  const { path } = useLearningPath();
  const { account, loading, displayProgress } = useGameAccount();
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);
  const recommendedStart = recommended[0] ?? other[0];
  const recommendedGames = recommended.filter(
    (game) => game.id !== recommendedStart?.id,
  );
  const otherGames = other.filter((game) => game.id !== recommendedStart?.id);
  const recommendedGroups = groupMinigames(recommendedGames);
  const otherGroups = groupMinigames(otherGames);

  return (
    <div className="page-container flex w-full flex-1 flex-col py-8 sm:py-12">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-overline">Krótkie rundy · szybkie liczenie</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Minigry · <span className="text-gradient-brand">{pathLabel}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Zacznij od jednej polecanej gry, wybierz tempo rundy, a resztę
          tematów odkrywaj wtedy, kiedy masz na nie ochotę.
        </p>
      </motion.header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
        <RecommendedStart game={recommendedStart} pathLabel={pathLabel} />

        <aside>
          <p className="mb-3 text-overline">Twój progres</p>
          {loading ? (
            <div className="h-[92px] animate-pulse rounded-2xl bg-surface" />
          ) : (
            <>
              <AccountLevelBar
                level={displayProgress.level}
                xp={displayProgress.xp}
                subtitle={
                  account?.isLoggedIn && account.profile
                    ? account.profile.nick
                    : "Gość · progres lokalny"
                }
              />
              {!account?.isLoggedIn && (
                <p className="mt-2 text-sm text-muted">
                  <Link href="/login" className="font-semibold text-accent">
                    Zaloguj się
                  </Link>{" "}
                  — zapisuj XP w chmurze na każdym urządzeniu.
                </p>
              )}
            </>
          )}
        </aside>
      </div>

      <section
        className="mt-12"
        aria-labelledby="minigame-mode-selection"
        data-testid="minigame-mode-selection"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-overline">Sposób gry</p>
            <h2
              id="minigame-mode-selection"
              className="mt-1 text-xl font-bold text-foreground"
            >
              Wybierz tryb
            </h2>
          </div>
          <p className="max-w-xl text-sm text-muted">
            Na czas to najprostszy start. Przetrwanie i maraton wybierz, gdy
            chcesz zmienić zasady rundy.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {MINIGAME_MODES.map((mode) => (
            <ModeHubCard
              key={mode.id}
              mode={mode}
              recommended={mode.id === "time_attack"}
            />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="minigame-library">
        <div>
          <p className="text-overline">Biblioteka</p>
          <h2
            id="minigame-library"
            className="mt-1 text-xl font-bold text-foreground"
          >
            Odkrywaj według tematu
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Gry są pogrupowane, żeby łatwiej było znaleźć konkretny rodzaj
            ćwiczeń. Otwórz tylko obszar, który Cię teraz interesuje.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {recommendedGroups.length > 0 ? (
            <MinigameLibraryDisclosure
              title={`Dopasowane do: ${pathLabel}`}
              description={`${gameCountLabel(recommendedGames.length)} poza polecanym startem.`}
              groups={recommendedGroups}
              testId="minigame-matched-library"
              open
            />
          ) : null}

          {otherGroups.length > 0 ? (
            <MinigameLibraryDisclosure
              title="Pełna biblioteka"
              description="Pozostałe minigry z innych ścieżek i poziomów."
              groups={otherGroups}
              testId="minigame-other-library"
            />
          ) : null}

          {!recommendedStart ? (
            <p className="rounded-2xl border border-surface-border bg-surface p-4 text-sm text-muted">
              Brak minigier — spróbuj zmienić ścieżkę w ustawieniach.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
