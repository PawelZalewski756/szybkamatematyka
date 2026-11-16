"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  MinigameGlyph,
  getGameVisual,
} from "@/components/minigry/minigame-visuals";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import { ArrowRight, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const QUICK_GAME_IDS = ["mnozenie", "prawda-falsz", "ulamki", "wzory"] as const;

function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

function DailyGameCard({ game }: { game: MinigameEntry }) {
  const visual = getGameVisual(game);

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      className="group flex flex-col gap-4 rounded-2xl border border-accent/35 bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 sm:p-6"
    >
      <span className="flex items-start justify-between gap-3">
        <MinigameGlyph visual={visual} size="hero" />
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          Minigra dnia
        </span>
      </span>

      <span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          {visual.label}
        </span>
        <span className="mt-1 block text-xl font-extrabold tracking-tight text-foreground group-hover:text-accent">
          {game.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">
          {game.description}
        </span>
      </span>

      <span className="mt-auto flex items-center justify-between gap-3 border-t border-surface-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Timer className="h-3.5 w-3.5 text-accent" aria-hidden />
          Na czas · 60 s
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          Zagraj
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </span>
    </Link>
  );
}

export function MinigamePromo() {
  const { path } = useLearningPath();
  const { recommended, other } = getMinigamesForPath(path);
  const pool = recommended.length > 0 ? recommended : other;
  const [day, setDay] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDay(dayNumber(new Date()));
  }, []);

  if (pool.length === 0) return null;

  const daily = pool[day % pool.length] ?? pool[0];
  const quickGames = QUICK_GAME_IDS.map((id) =>
    pool.find((game) => game.id === id),
  )
    .filter((game): game is MinigameEntry => Boolean(game))
    .slice(0, 3);

  return (
    <section className="border-b border-surface-border bg-accent-soft/35 py-14 sm:py-20">
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:gap-16">
          <div>
            <p className="text-overline">MINIGRY</p>
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Minuta na rozgrzewkę
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              Wybierz grę i licz w głowie przez 60 sekund. Po rundzie zobaczysz
              wynik, a punkty zapiszą się na koncie, jeśli się zalogujesz.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/minigry" className="btn-chunky px-6 py-3.5 text-sm">
                Zagraj teraz
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/minigry"
                className="text-sm font-bold text-foreground underline decoration-surface-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
              >
                Zobacz wszystkie gry
              </Link>
            </div>

            {quickGames.length > 0 ? (
              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  Popularne gry
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickGames.map((game) => {
                    const visual = getGameVisual(game);
                    return (
                      <Link
                        key={game.id}
                        href={`${game.href}?mode=time_attack`}
                        className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-2 text-xs font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
                      >
                        <MinigameGlyph visual={visual} size="card" />
                        {game.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <DailyGameCard game={daily} />
        </div>
      </div>
    </section>
  );
}
