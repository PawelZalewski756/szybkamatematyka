"use client";

import { createDuelConfig } from "@/lib/pojedynki/duel-config";
import { resolveDuel } from "@/lib/pojedynki/duel-engine";
import { duelMinigameTitle } from "@/lib/pojedynki/duel-questions";
import { useDuelRealtime } from "@/lib/pojedynki/use-duel-realtime";
import type { DuelConfig, DuelResult } from "@/lib/pojedynki/duel-types";
import { DuelArena } from "@/components/pojedynki/DuelArena";
import { DuelResultScreen } from "@/components/pojedynki/DuelResultScreen";
import type { LearningPath } from "@/lib/learning-path";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

type OnlineDuelProps = {
  slug: string;
  path: LearningPath;
  length: number;
  playerName: string;
  onExit: () => void;
};

type View = "choose" | "lobby" | "arena" | "result";

export function OnlineDuel({
  slug,
  path,
  length,
  playerName,
  onExit,
}: OnlineDuelProps) {
  const rt = useDuelRealtime(playerName);
  const [view, setView] = useState<View>("choose");
  const [seedKey, setSeedKey] = useState(0);
  const [joinInput, setJoinInput] = useState("");
  const [myResult, setMyResult] = useState<DuelResult | null>(null);

  const hostConfig = useMemo<DuelConfig>(
    () => createDuelConfig({ slug, path, questionCount: length }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, path, length, seedKey],
  );

  const activeConfig = rt.role === "host" ? hostConfig : rt.config;
  const title = duelMinigameTitle(slug);

  // Przejście do areny po starcie zsynchronizowanym przez hosta (sygnał z
  // zewnętrznego systemu — Realtime broadcast).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rt.status === "started" && rt.startAt) setView("arena");
  }, [rt.status, rt.startAt]);

  // Po zebraniu obu wyników — ekran rozstrzygnięcia (wynik rywala przychodzi
  // broadcastem).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (myResult && rt.opponentResult) setView("result");
  }, [myResult, rt.opponentResult]);

  const handleHost = useCallback(() => {
    rt.createRoom(hostConfig);
    setView("lobby");
  }, [rt, hostConfig]);

  const handleJoin = useCallback(() => {
    if (!joinInput.trim()) return;
    rt.joinRoom(joinInput);
    setView("lobby");
  }, [rt, joinInput]);

  const leaveAll = useCallback(() => {
    rt.leave();
    setMyResult(null);
    setView("choose");
    onExit();
  }, [rt, onExit]);

  const rematch = useCallback(() => {
    rt.leave();
    setMyResult(null);
    setSeedKey((k) => k + 1);
    setView("choose");
  }, [rt]);

  if (!rt.available) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-6xl">📡</p>
        <h1 className="mt-3 text-3xl font-black text-white">
          Tryb online niedostępny
        </h1>
        <p className="mt-3 max-w-md text-zinc-400">
          Pojedynki w czasie rzeczywistym wymagają skonfigurowanego Supabase.
          Bez problemu zagrasz w trybie „Na kod”, lokalnym lub z botem.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-4 text-lg font-black text-white"
        >
          ← Wybierz inny tryb
        </button>
      </div>
    );
  }

  if (view === "choose") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
          {title} · Online
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Pojedynek na żywo
        </h1>
        <p className="mt-3 max-w-md text-zinc-400">
          Stwórz pokój i podaj kod znajomemu, albo dołącz do istniejącego pokoju.
        </p>

        <button
          type="button"
          onClick={handleHost}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 px-6 py-5 text-lg font-black text-white shadow-lg shadow-cyan-500/30"
        >
          🎮 Stwórz pokój
        </button>

        <div className="mt-6 w-full rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Dołącz po kodzie
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              placeholder="np. K7M2P"
              maxLength={8}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-center text-xl font-black tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-zinc-600 focus:border-fuchsia-500/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleJoin}
              className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-base font-black text-white"
            >
              Dołącz
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-6 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
        >
          ← Zmień tryb
        </button>
      </div>
    );
  }

  if (view === "lobby") {
    const isHost = rt.role === "host";
    const canStart = isHost && rt.opponentPresent && rt.status === "ready";
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
          {title}
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Poczekalnia</h1>

        {isHost && rt.code && (
          <div className="mt-6 w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Kod pokoju
            </p>
            <p className="mt-1 text-5xl font-black tracking-[0.3em] text-white">
              {rt.code}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Podaj ten kod rywalowi.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 text-sm">
          <span
            className={`h-3 w-3 rounded-full ${
              rt.opponentPresent ? "bg-emerald-400" : "animate-pulse bg-amber-400"
            }`}
          />
          <span className="font-semibold text-zinc-300">
            {rt.opponentPresent
              ? `${rt.opponentName ?? "Rywal"} w pokoju`
              : "Czekam na rywala…"}
          </span>
        </div>

        {rt.error && <p className="mt-4 text-sm text-red-400">{rt.error}</p>}

        {isHost ? (
          <button
            type="button"
            onClick={rt.startMatch}
            disabled={!canStart}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 py-5 text-xl font-black text-white shadow-xl shadow-fuchsia-500/40 disabled:opacity-50"
          >
            {canStart ? "Start pojedynku!" : "Czekam na rywala…"}
          </button>
        ) : (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="mt-8 text-lg font-bold text-zinc-300"
          >
            {rt.config
              ? "Czekam, aż gospodarz wystartuje…"
              : "Łączę z pokojem…"}
          </motion.p>
        )}

        <button
          type="button"
          onClick={leaveAll}
          className="mt-6 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
        >
          ← Opuść pokój
        </button>
      </div>
    );
  }

  if (view === "arena" && activeConfig) {
    return (
      <DuelArena
        config={activeConfig}
        playerName={playerName}
        opponent={{ name: rt.opponentName ?? "Rywal", kind: "human" }}
        opponentProgress={rt.opponentProgress}
        opponentPending="Łączę…"
        startAt={rt.startAt}
        onProgress={rt.sendProgress}
        onFinish={(r) => {
          setMyResult(r);
          rt.sendResult(r);
        }}
      />
    );
  }

  if (view === "result" && myResult && rt.opponentResult) {
    return (
      <DuelResultScreen
        outcome={resolveDuel(myResult, rt.opponentResult)}
        myName={playerName}
        opponent={{ name: rt.opponentName ?? "Rywal", kind: "human" }}
        myResult={myResult}
        opponentResult={rt.opponentResult}
        slug={slug}
        mode="online"
        onRematch={rematch}
      />
    );
  }

  return null;
}
