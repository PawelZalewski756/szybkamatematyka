"use client";

import { createDuelConfig } from "@/lib/pojedynki/duel-config";
import { resolveDuel } from "@/lib/pojedynki/duel-engine";
import {
  BOT_PRESETS,
  simulateBotResult,
  type BotLevel,
} from "@/lib/pojedynki/duel-storage";
import type {
  DuelConfig,
  DuelOpponentInfo,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { duelMinigameTitle } from "@/lib/pojedynki/duel-questions";
import { DuelArena } from "@/components/pojedynki/DuelArena";
import { DuelResultScreen } from "@/components/pojedynki/DuelResultScreen";
import type { LearningPath } from "@/lib/learning-path";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

type LocalDuelProps = {
  slug: string;
  path: LearningPath;
  length: number;
  playerName: string;
  variant: "local" | "bot";
  botLevel?: BotLevel;
  onExit: () => void;
};

type Stage = "ready1" | "play1" | "ready2" | "play2" | "playBot" | "result";

function ReadyCard({
  title,
  heading,
  subtitle,
  buttonLabel,
  onStart,
  onExit,
}: {
  title: string;
  heading: string;
  subtitle: string;
  buttonLabel: string;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
        {title}
      </p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-4xl font-black text-white"
      >
        {heading}
      </motion.h1>
      <p className="mt-4 max-w-md text-zinc-400">{subtitle}</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-10 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 py-5 text-xl font-black text-white shadow-xl shadow-fuchsia-500/40"
      >
        {buttonLabel}
      </button>
      <button
        type="button"
        onClick={onExit}
        className="mt-4 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
      >
        ← Zmień tryb
      </button>
    </div>
  );
}

export function LocalDuel({
  slug,
  path,
  length,
  playerName,
  variant,
  botLevel = "medium",
  onExit,
}: LocalDuelProps) {
  const [seedKey, setSeedKey] = useState(0);
  const config = useMemo<DuelConfig>(
    () => createDuelConfig({ slug, path, questionCount: length }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, path, length, seedKey],
  );

  const [stage, setStage] = useState<Stage>(
    variant === "bot" ? "playBot" : "ready1",
  );
  const [result1, setResult1] = useState<DuelResult | null>(null);
  const [result2, setResult2] = useState<DuelResult | null>(null);

  const botResult = useMemo(
    () => (variant === "bot" ? simulateBotResult(config, botLevel) : null),
    [variant, config, botLevel],
  );

  const player2Name = variant === "bot" ? BOT_PRESETS[botLevel].name : "Gracz 2";
  const title = duelMinigameTitle(slug);

  const rematch = useCallback(() => {
    setResult1(null);
    setResult2(null);
    setSeedKey((k) => k + 1);
    setStage(variant === "bot" ? "playBot" : "ready1");
  }, [variant]);

  const botOpponent: DuelOpponentInfo = { name: player2Name, kind: "bot" };
  const humanOpponent: DuelOpponentInfo = { name: player2Name, kind: "human" };

  if (stage === "ready1") {
    return (
      <ReadyCard
        title={title}
        heading="Tura gracza 1"
        subtitle="Gracz 1 rozwiązuje pierwszy. Gracz 2 dostanie DOKŁADNIE ten sam zestaw pytań."
        buttonLabel="Gracz 1 — start"
        onStart={() => setStage("play1")}
        onExit={onExit}
      />
    );
  }

  if (stage === "play1") {
    return (
      <DuelArena
        config={config}
        playerName="Gracz 1"
        opponent={humanOpponent}
        opponentPending="Zagra po Tobie (ten sam zestaw)"
        onFinish={(r) => {
          setResult1(r);
          setStage("ready2");
        }}
      />
    );
  }

  if (stage === "ready2") {
    return (
      <ReadyCard
        title={title}
        heading="Tura gracza 2"
        subtitle="Przekaż urządzenie. Ten sam zestaw pytań — kto będzie lepszy?"
        buttonLabel="Gracz 2 — start"
        onStart={() => setStage("play2")}
        onExit={onExit}
      />
    );
  }

  if (stage === "play2") {
    return (
      <DuelArena
        config={config}
        playerName="Gracz 2"
        opponent={{ name: "Gracz 1", kind: "human" }}
        opponentProgress={
          result1
            ? {
                answered: result1.total,
                correct: result1.correct,
                score: result1.score,
                finished: true,
              }
            : null
        }
        onFinish={(r) => {
          setResult2(r);
          setStage("result");
        }}
      />
    );
  }

  if (stage === "playBot") {
    return (
      <DuelArena
        config={config}
        playerName={playerName}
        opponent={botOpponent}
        opponentPending={`${player2Name} rozwiązuje ten sam zestaw…`}
        onFinish={(r) => {
          setResult1(r);
          setStage("result");
        }}
      />
    );
  }

  // stage === "result"
  if (variant === "bot") {
    if (!result1 || !botResult) return null;
    return (
      <DuelResultScreen
        outcome={resolveDuel(result1, botResult)}
        myName={playerName}
        opponent={botOpponent}
        myResult={result1}
        opponentResult={botResult}
        slug={slug}
        mode="bot"
        awardXp={botLevel !== "easy"}
        onRematch={rematch}
      />
    );
  }

  if (!result1 || !result2) return null;
  return (
    <DuelResultScreen
      outcome={resolveDuel(result2, result1)}
      myName="Gracz 2"
      opponent={{ name: "Gracz 1", kind: "human" }}
      myResult={result2}
      opponentResult={result1}
      slug={slug}
      mode="local"
      awardXp={false}
      onRematch={rematch}
    />
  );
}
