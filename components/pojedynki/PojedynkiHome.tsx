"use client";

import { useDuel } from "@/components/pojedynki/DuelProvider";
import { OnlineDuel } from "@/components/pojedynki/OnlineDuel";
import { ChallengeDuel } from "@/components/pojedynki/ChallengeDuel";
import { LocalDuel } from "@/components/pojedynki/LocalDuel";
import { getMinigamesForPath } from "@/lib/minigry/minigames-catalog";
import { DUEL_LENGTH_OPTIONS, type DuelLength } from "@/lib/pojedynki/duel-config";
import { BOT_PRESETS, type BotLevel } from "@/lib/pojedynki/duel-storage";
import { learningPathLabel } from "@/lib/learning-path";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { motion } from "framer-motion";
import { Bot, Pencil, Radio, Share2, Swords, Users } from "lucide-react";
import { useState } from "react";

type Delivery = "online" | "challenge" | "local" | "bot";

const BOT_LEVELS: BotLevel[] = ["easy", "medium", "hard"];

function NameEditor() {
  const { playerName, setPlayerName } = useDuel();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(playerName);

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          maxLength={24}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPlayerName(draft);
              setEditing(false);
            }
          }}
          className="input-field w-40 px-3 py-1.5 text-sm font-bold"
        />
        <button
          type="button"
          onClick={() => {
            setPlayerName(draft);
            setEditing(false);
          }}
          className="btn-primary rounded-lg px-3 py-1.5 text-sm"
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(playerName);
        setEditing(true);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-sm font-bold text-foreground transition-colors hover:border-accent/40"
    >
      {playerName}
      <Pencil className="h-3.5 w-3.5 text-muted" />
    </button>
  );
}

export function PojedynkiHome() {
  const { slug, setSlug, length, setLength, path, playerName, ready } =
    useDuel();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [botLevel, setBotLevel] = useState<BotLevel>("medium");

  const { recommended, other } = getMinigamesForPath(path);
  const games = [...recommended, ...other];
  const pathLabel = learningPathLabel(path);
  const supabaseOn = isSupabaseConfigured();

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted">
        Ładowanie pojedynków…
      </div>
    );
  }

  if (delivery) {
    const exit = () => setDelivery(null);
    const common = { slug, path, length, playerName, onExit: exit };
    return (
      <div className="flex w-full flex-1 flex-col">
        {delivery === "online" && <OnlineDuel {...common} />}
        {delivery === "challenge" && <ChallengeDuel {...common} />}
        {delivery === "local" && <LocalDuel {...common} variant="local" />}
        {delivery === "bot" && (
          <LocalDuel {...common} variant="bot" botLevel={botLevel} />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <span className="icon-chip h-11 w-11 rounded-2xl">
            <Swords className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
            Pojedynki{" "}
            <span className="text-gradient-brand">1v1</span>
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-lg text-muted">
          Dwóch graczy, ten sam zestaw pytań, jeden zwycięzca. Graj na żywo,
          wyślij wyzwanie znajomemu albo zmierz się z botem.
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">Grasz jako:</span>
        <NameEditor />
        <span className="text-sm text-muted">
          Ścieżka: <span className="font-semibold text-accent">{pathLabel}</span>
        </span>
      </div>

      {/* Wybór minigry */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-foreground">1. Wybierz minigrę</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => {
            const selected = game.id === slug;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => setSlug(game.id)}
                className={`group relative flex min-h-[96px] flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-accent/60 bg-accent/10 shadow-lg"
                    : "border-surface-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
                }`}
              >
                <span className="text-3xl">{game.emoji}</span>
                <span className="mt-2 text-sm font-black text-foreground">
                  {game.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Długość pojedynku */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-foreground">2. Liczba pytań</h2>
        <div className="mt-4 flex gap-3">
          {DUEL_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLength(opt as DuelLength)}
              className={`flex-1 rounded-2xl border py-4 text-xl font-black transition sm:flex-none sm:px-10 ${
                length === opt
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-surface-border bg-surface text-foreground hover:border-accent/30 hover:bg-surface-hover"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Tryb pojedynku */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-foreground">3. Wybierz tryb</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModeCard
            icon={<Radio className="h-6 w-6" />}
            title="Na żywo (online)"
            description={
              supabaseOn
                ? "Pokój z kodem, podgląd rywala w czasie rzeczywistym."
                : "Wymaga Supabase — u Ciebie obecnie niedostępne."
            }
            onClick={() => setDelivery("online")}
            badge={supabaseOn ? "Realtime" : "Offline"}
            dim={!supabaseOn}
          />
          <ModeCard
            icon={<Share2 className="h-6 w-6" />}
            title="Na kod"
            description="Zagraj i wyślij kod. Async/ghost — działa też offline."
            onClick={() => setDelivery("challenge")}
            badge="Async"
          />
          <ModeCard
            icon={<Users className="h-6 w-6" />}
            title="Lokalnie (hot-seat)"
            description="Dwóch graczy na jednym urządzeniu, po kolei."
            onClick={() => setDelivery("local")}
            badge="1 urządzenie"
          />
          <ModeCard
            icon={<Bot className="h-6 w-6" />}
            title="Z botem"
            description="Trening z przeciwnikiem AI o wybranym poziomie."
            onClick={() => setDelivery("bot")}
            badge="Trening"
          >
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {BOT_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBotLevel(lvl);
                  }}
                  className={`flex-1 rounded-lg border px-2 py-1 text-xs font-bold transition ${
                    botLevel === lvl
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-surface-border bg-surface text-muted"
                  }`}
                >
                  {BOT_PRESETS[lvl].label}
                </button>
              ))}
            </div>
          </ModeCard>
        </div>
      </section>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  badge,
  dim = false,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  dim?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`card-raised group relative flex cursor-pointer flex-col p-6 text-left transition hover:scale-[1.01] active:scale-[0.99] ${
        dim ? "opacity-70" : ""
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full border border-surface-border bg-surface-hover px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted">
          {badge}
        </span>
      )}
      <span className="icon-chip h-11 w-11 rounded-2xl">{icon}</span>
      <span className="mt-4 text-xl font-black text-foreground">{title}</span>
      <span className="mt-1 text-sm font-medium text-muted">{description}</span>
      {children}
    </div>
  );
}
