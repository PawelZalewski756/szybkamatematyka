"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import {
  groupMinigames,
  type MinigameGroup,
  type MinigameGroupVisual,
} from "@/components/minigry/minigame-groups";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  MinigameGlyph,
  VISUAL_TONES,
  getGameVisual,
  type VisualTone,
} from "@/components/minigry/minigame-visuals";
import {
  MINIGAME_MODES,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { learningPathLabel } from "@/lib/learning-path";
import { useGameAccount } from "@/lib/minigry/use-game-account";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  Layers,
  LineChart,
  Radical,
  ShieldCheck,
  Sigma,
  Timer,
  Triangle,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function gameCountLabel(count: number): string {
  if (count === 1) return "1 gra";
  if (count >= 2 && count <= 4) return `${count} gry`;
  return `${count} gier`;
}

const GROUP_ICONS: Record<MinigameGroupVisual["icon"], LucideIcon> = {
  calculator: Calculator,
  sigma: Sigma,
  radical: Radical,
  triangle: Triangle,
  "line-chart": LineChart,
  layers: Layers,
};

const MODE_VISUALS: Record<
  MinigamePlayMode,
  { icon: LucideIcon; tone: VisualTone }
> = {
  time_attack: { icon: Timer, tone: "amber" },
  survival: { icon: ShieldCheck, tone: "rose" },
  marathon: { icon: Trophy, tone: "sky" },
};

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

  const visual = getGameVisual(game);

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-recommended-start"
      className="group relative isolate overflow-hidden rounded-r-2xl border-y border-r border-accent/35 border-l-4 border-l-accent bg-accent-soft/30 p-4 transition hover:bg-accent-soft/50 sm:p-5"
    >
      <span className="flex items-start gap-4">
        <MinigameGlyph visual={visual} size="hero" />
        <span className="min-w-0 flex-1">
          <span className="text-overline text-accent">
            Proponowana minigra · {visual.label}
          </span>
          <h2 className="mt-1 text-lg font-extrabold text-foreground sm:text-xl">
            {game.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {game.description}
          </p>
          <span className="btn-chunky mt-3 px-4 py-2 text-sm">
            Zagraj teraz
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </span>
      </span>
      <span className="sr-only">{pathLabel} · na czas · 60 s</span>
    </Link>
  );
}

function ModeCard({ mode }: { mode: (typeof MINIGAME_MODES)[number] }) {
  const visual = MODE_VISUALS[mode.id];
  const Icon = visual.icon;
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`/minigry/modes/${mode.slug}`}
      data-testid={`minigame-mode-${mode.id}`}
      className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-3.5 py-3 transition hover:border-accent/45 hover:bg-surface-hover"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone.panel}`}>
        <Icon className={`h-4 w-4 ${tone.text}`} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground">
          {mode.title}
        </span>
        <span className="block text-xs leading-snug text-muted">
          {mode.description}
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}

function MinigameCard({ game }: { game: MinigameEntry }) {
  const visual = getGameVisual(game);
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-game-card"
      className="group flex min-h-[88px] overflow-hidden rounded-xl border border-surface-border bg-surface transition-[border-color,background-color] hover:border-accent/45 hover:bg-surface-hover"
    >
      <MinigameGlyph visual={visual} size="card" />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3.5">
        <span className={`block text-[11px] font-bold uppercase tracking-[0.12em] ${tone.text}`}>
          {visual.label}
        </span>
        <span className="block line-clamp-1 text-sm font-bold text-foreground">
          {game.title}
        </span>
      </span>
    </Link>
  );
}

function GroupAccordion({ group }: { group: MinigameGroup }) {
  const Icon = GROUP_ICONS[group.visual.icon];
  const tone = VISUAL_TONES[group.visual.tone];

  return (
    <details
      className="group overflow-hidden rounded-xl border border-surface-border bg-surface"
      data-testid={`minigame-group-${group.id}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5 marker:content-none sm:p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${tone.panel}`}>
          <Icon className={`h-4 w-4 ${tone.text}`} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="text-sm font-bold text-foreground">
              {group.title}
            </span>
            <span className="text-xs text-muted">
              {gameCountLabel(group.games.length)}
            </span>
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-surface-border p-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {group.games.map((game) => (
            <MinigameCard key={game.id} game={game} />
          ))}
        </div>
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
  // Jedna lista grup: gry dopasowane do ścieżki trafiają do swoich obszarów
  // razem z pozostałymi, więc nie ma dwóch sekcji z tym samym tytułem.
  const groups = groupMinigames([...recommendedGames, ...otherGames]);
  const gameCount = groups.reduce((total, group) => total + group.games.length, 0);

  return (
    <div className="page-container flex w-full flex-1 flex-col py-6 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Minigry · <span className="text-gradient-brand">{pathLabel}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Wybierz grę i tryb.
        </p>
      </motion.header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
        <RecommendedStart game={recommendedStart} pathLabel={pathLabel} />

        <aside>
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
                  - zapisuj XP w chmurze.
                </p>
              )}
            </>
          )}
        </aside>
      </div>

      <section
        className="mt-8"
        aria-labelledby="minigame-mode-selection"
        data-testid="minigame-mode-selection"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="minigame-mode-selection"
            className="text-lg font-extrabold text-foreground"
          >
            Tryb gry
          </h2>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MINIGAME_MODES.map((mode) => (
            <ModeCard key={mode.id} mode={mode} />
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="minigame-library">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="minigame-library"
              className="text-lg font-extrabold text-foreground"
            >
              Biblioteka gier
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {gameCountLabel(gameCount)} w {groups.length} obszarach
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {groups.map((group) => (
            <GroupAccordion key={group.id} group={group} />
          ))}

          {!recommendedStart ? (
            <p className="rounded-xl border border-surface-border bg-surface p-4 text-sm text-muted">
              Brak minigier - spróbuj zmienić ścieżkę w ustawieniach.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
