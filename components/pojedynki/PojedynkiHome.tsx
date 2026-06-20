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
          className="w-40 rounded-lg border border-fuchsia-500/40 bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setPlayerName(draft);
            setEditing(false);
          }}
          className="rounded-lg bg-fuchsia-500/20 px-3 py-1.5 text-sm font-bold text-fuchsia-300"
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:border-fuchsia-500/40"
    >
      {playerName}
      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
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
      <div className="flex flex-1 items-center justify-center py-20 text-zinc-500">
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
          <span className="rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 p-2.5 shadow-lg shadow-fuchsia-500/30">
            <Swords className="h-6 w-6 text-white" />
          </span>
          <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Pojedynki{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              1v1
            </span>
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-lg text-zinc-400">
          Dwóch graczy, ten sam zestaw pytań, jeden zwycięzca. Graj na żywo,
          wyślij wyzwanie znajomemu albo zmierz się z botem.
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-500">Grasz jako:</span>
        <NameEditor />
        <span className="text-sm text-zinc-500">
          Ścieżka: <span className="font-semibold text-cyan-300">{pathLabel}</span>
        </span>
      </div>

      {/* Wybór minigry */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-white">1. Wybierz minigrę</h2>
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
                    ? "border-fuchsia-500/60 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-3xl">{game.emoji}</span>
                <span className="mt-2 text-sm font-black text-white">
                  {game.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Długość pojedynku */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-white">2. Liczba pytań</h2>
        <div className="mt-4 flex gap-3">
          {DUEL_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLength(opt as DuelLength)}
              className={`flex-1 rounded-2xl border py-4 text-xl font-black transition sm:flex-none sm:px-10 ${
                length === opt
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.04] text-white hover:border-white/20"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Tryb pojedynku */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-white">3. Wybierz tryb</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModeCard
            icon={<Radio className="h-6 w-6" />}
            title="Na żywo (online)"
            description={
              supabaseOn
                ? "Pokój z kodem, podgląd rywala w czasie rzeczywistym."
                : "Wymaga Supabase — u Ciebie obecnie niedostępne."
            }
            accent="from-emerald-600 via-teal-500 to-cyan-600"
            onClick={() => setDelivery("online")}
            badge={supabaseOn ? "Realtime" : "Offline"}
            dim={!supabaseOn}
          />
          <ModeCard
            icon={<Share2 className="h-6 w-6" />}
            title="Na kod"
            description="Zagraj i wyślij kod. Async/ghost — działa też offline."
            accent="from-violet-600 via-fuchsia-500 to-pink-500"
            onClick={() => setDelivery("challenge")}
            badge="Async"
          />
          <ModeCard
            icon={<Users className="h-6 w-6" />}
            title="Lokalnie (hot-seat)"
            description="Dwóch graczy na jednym urządzeniu, po kolei."
            accent="from-amber-500 via-orange-500 to-red-500"
            onClick={() => setDelivery("local")}
            badge="1 urządzenie"
          />
          <ModeCard
            icon={<Bot className="h-6 w-6" />}
            title="Z botem"
            description="Trening z przeciwnikiem AI o wybranym poziomie."
            accent="from-sky-600 via-blue-500 to-indigo-600"
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
                      ? "border-white/50 bg-white/15 text-white"
                      : "border-white/15 bg-black/20 text-white/70"
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
  accent,
  badge,
  dim = false,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
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
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${accent} p-6 text-left shadow-lg transition hover:scale-[1.01] active:scale-[0.99] ${
        dim ? "opacity-70" : ""
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
        {icon}
      </span>
      <span className="mt-4 text-xl font-black text-white">{title}</span>
      <span className="mt-1 text-sm font-medium text-white/85">
        {description}
      </span>
      {children}
    </div>
  );
}
