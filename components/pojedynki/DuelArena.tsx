"use client";

import { getMinigameBySlug } from "@/lib/minigry/minigame-registry";
import { COMBO_DISPLAY_MIN } from "@/lib/minigry/game-constants";
import { formatDuration } from "@/lib/pojedynki/duel-engine";
import type {
  DuelConfig,
  DuelOpponentInfo,
  DuelProgress,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { useDuelMatch } from "@/lib/pojedynki/use-duel-match";
import { DuelProgressBars } from "@/components/pojedynki/DuelProgressBars";
import { DuelQuestionCard } from "@/components/pojedynki/DuelQuestionCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type DuelArenaProps = {
  config: DuelConfig;
  playerName: string;
  opponent: DuelOpponentInfo;
  /** Postęp rywala na żywo (online/bot-live). Null → tryb bez podglądu. */
  opponentProgress?: DuelProgress | null;
  /** Tekst w pasku rywala, gdy brak postępu (np. „Gra ten sam zestaw"). */
  opponentPending?: string;
  /** Timestamp startu do synchronizacji (online). Brak → odliczanie 3s lokalnie. */
  startAt?: number | null;
  onProgress?: (progress: DuelProgress) => void;
  onFinish: (result: DuelResult) => void;
};

export function DuelArena({
  config,
  playerName,
  opponent,
  opponentProgress = null,
  opponentPending,
  startAt = null,
  onProgress,
  onFinish,
}: DuelArenaProps) {
  const def = getMinigameBySlug(config.slug);
  const match = useDuelMatch(config, { onProgress, onFinish });
  const { start } = match;

  const [count, setCount] = useState(() =>
    startAt ? Math.max(0, Math.ceil((startAt - Date.now()) / 1000)) : 3,
  );
  const [counting, setCounting] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(false);

  // Odliczanie startu (synchronizacja online lub lokalne 3-2-1).
  useEffect(() => {
    if (!counting) return;
    if (count <= 0) {
      if (!startedRef.current) {
        startedRef.current = true;
        setCounting(false);
        start();
      }
      return;
    }
    const id = window.setTimeout(() => {
      setCount((c) => {
        if (startAt) return Math.max(0, Math.ceil((startAt - Date.now()) / 1000));
        return c - 1;
      });
    }, startAt ? 200 : 1000);
    return () => window.clearTimeout(id);
  }, [counting, count, start, startAt]);

  // Licznik czasu rozgrywki.
  useEffect(() => {
    if (match.phase !== "playing") return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [match.phase]);

  const meProgress: DuelProgress = {
    answered: match.progress.answered,
    correct: match.correct,
    score: match.score,
    finished: match.phase === "finished",
  };

  const answerClass = def?.answerClass ?? "border-accent/30";

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
      <AnimatePresence>
        {match.flash === "correct" && (
          <motion.div
            key="flash-correct"
            className="pointer-events-none fixed inset-0 z-50 bg-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}
        {match.flash === "wrong" && (
          <motion.div
            key="flash-wrong"
            className="pointer-events-none fixed inset-0 z-50 bg-red-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.42 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      <DuelProgressBars
        total={match.total}
        me={{
          name: `${playerName} (Ty)`,
          progress: meProgress,
          variant: "me",
        }}
        opponent={{
          name: opponent.name,
          progress: opponentProgress,
          variant: "opponent",
          pending: opponentPending,
        }}
      />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface/90 px-4 py-3 shadow-lg">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Pytanie {Math.min(match.index + 1, match.total)}/{match.total}
        </p>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {match.combo >= COMBO_DISPLAY_MIN && (
              <motion.span
                key="combo"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="rounded-full border border-accent/50 bg-accent/20 px-2 py-0.5 text-xs font-black text-accent"
              >
                🔥 x{match.combo}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-sm font-black tabular-nums text-accent">
            {formatDuration(elapsed * 1000)}
          </span>
        </div>
      </div>

      <motion.div
        className="mt-5 flex flex-1 flex-col justify-center"
        animate={match.shake ? { x: [0, -12, 12, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.36 }}
        onAnimationComplete={() => match.setShake(false)}
      >
        {counting || match.phase !== "playing" ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-surface-border bg-surface/95 px-4 py-16 text-center">
            {match.phase === "finished" ? (
              <>
                <p className="text-5xl">🏁</p>
                <p className="mt-4 text-xl font-black text-foreground">
                  Twój wynik gotowy!
                </p>
                <p className="mt-1 text-sm text-muted">
                  Czekamy na rozstrzygnięcie…
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-accent">
                  {def?.title ?? "Pojedynek"}
                </p>
                <motion.p
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 text-7xl font-black text-foreground"
                >
                  {count > 0 ? count : "START!"}
                </motion.p>
                <p className="mt-3 text-sm text-muted">
                  Rywal: {opponent.name}
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={match.index}
              className="rounded-3xl border border-surface-border bg-surface/95 px-4 py-10 text-center shadow-xl sm:px-6 sm:py-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {match.current && (
                <DuelQuestionCard
                  question={match.current}
                  answerClass={answerClass}
                  onAnswer={match.answer}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
