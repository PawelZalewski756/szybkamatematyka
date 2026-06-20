"use client";

import { FLASH_MS } from "@/lib/minigry/game-constants";
import type {
  DuelConfig,
  DuelProgress,
  DuelQuestion,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { generateDuelQuestions } from "@/lib/pojedynki/duel-questions";
import { isAnswerCorrect, pointsForCombo } from "@/lib/pojedynki/duel-engine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DuelMatchPhase = "idle" | "playing" | "finished";
export type DuelFlash = "none" | "correct" | "wrong";

type UseDuelMatchOptions = {
  /** Wywoływane po każdej odpowiedzi (do broadcastu postępu w trybie online). */
  onProgress?: (progress: DuelProgress) => void;
  /** Wywoływane raz po ukończeniu pojedynku. */
  onFinish?: (result: DuelResult) => void;
};

/**
 * Sterownik rozgrywki pojedynku: przechodzi przez deterministyczną listę pytań,
 * liczy punkty/combo/czas (spójnie z minigrami) i produkuje DuelResult.
 * Reużywany przez WSZYSTKIE tryby (online, kod, lokalny, bot).
 */
export function useDuelMatch(
  config: DuelConfig,
  options: UseDuelMatchOptions = {},
) {
  const { onProgress, onFinish } = options;
  const questions = useMemo<DuelQuestion[]>(
    () => generateDuelQuestions(config),
    [config],
  );

  const [phase, setPhase] = useState<DuelMatchPhase>("idle");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [flash, setFlash] = useState<DuelFlash>("none");
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<DuelResult | null>(null);

  const startTimeRef = useRef<number>(0);
  const lockRef = useRef(false);

  useEffect(() => {
    if (flash === "none") return;
    const id = window.setTimeout(() => setFlash("none"), FLASH_MS);
    return () => window.clearTimeout(id);
  }, [flash]);

  const start = useCallback(() => {
    setPhase("playing");
    setIndex(0);
    setScore(0);
    setCombo(0);
    setCorrect(0);
    setFlash("none");
    setShake(false);
    setResult(null);
    lockRef.current = false;
    startTimeRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  const answer = useCallback(
    (value: number | boolean | string) => {
      if (phase !== "playing") return;
      if (lockRef.current) return;
      const question = questions[index];
      if (!question) return;

      const hit = isAnswerCorrect(question, value);
      const nextCombo = hit ? combo + 1 : 0;
      const gained = hit ? pointsForCombo(nextCombo) : 0;
      const nextScore = score + gained;
      const nextCorrect = correct + (hit ? 1 : 0);
      const nextAnswered = index + 1;

      setCombo(nextCombo);
      setScore(nextScore);
      setCorrect(nextCorrect);
      setFlash(hit ? "correct" : "wrong");
      if (!hit) setShake(true);

      const finished = nextAnswered >= questions.length;

      onProgress?.({
        answered: nextAnswered,
        correct: nextCorrect,
        score: nextScore,
        finished,
      });

      if (finished) {
        lockRef.current = true;
        const now =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const finalResult: DuelResult = {
          score: nextScore,
          correct: nextCorrect,
          total: questions.length,
          durationMs: Math.max(0, Math.round(now - startTimeRef.current)),
        };
        setResult(finalResult);
        setPhase("finished");
        onFinish?.(finalResult);
      } else {
        setIndex(nextAnswered);
      }
    },
    [phase, questions, index, combo, score, correct, onProgress, onFinish],
  );

  const progress: DuelProgress = {
    answered: phase === "finished" ? questions.length : index,
    correct,
    score,
    finished: phase === "finished",
  };

  return {
    questions,
    total: questions.length,
    current: questions[index] ?? null,
    index,
    phase,
    score,
    combo,
    correct,
    flash,
    shake,
    setShake,
    result,
    progress,
    start,
    answer,
  };
}
