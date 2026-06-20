"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  BASE_POINTS,
  COMBO_DISPLAY_MIN,
  FLASH_MS,
} from "@/lib/minigry/game-constants";
import {
  MARATHON_QUESTION_COUNT,
  TIME_ATTACK_SECONDS,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { getDisplayProgress } from "@/lib/minigry/account-progress";
import {
  learningPathLabel,
  questionTrackForPath,
  questionTrackLabel,
} from "@/lib/learning-path";
import { useGameAccount } from "@/lib/minigry/use-game-account";
import { saveProfileAfterGame } from "@/lib/supabase/profiles";
import { useCallback, useEffect, useRef, useState } from "react";

export type MinigamePhase = "start" | "playing" | "gameover";
export type FeedbackFlash = "none" | "correct" | "wrong";

export function useMinigameSession(mode: MinigamePlayMode = "time_attack") {
  const { account, loading: accountLoading } = useGameAccount();
  const { path, ready: pathReady } = useLearningPath();
  const questionTrack = questionTrackForPath(path);
  const pathLabel = learningPathLabel(path);

  const [phase, setPhase] = useState<MinigamePhase>("start");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_SECONDS);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<FeedbackFlash>("none");
  const [scoreAnimating, setScoreAnimating] = useState(false);
  const [shake, setShake] = useState(false);
  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);
  const [lastPointsGain, setLastPointsGain] = useState<number | null>(null);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const xpAppliedRef = useRef(false);
  const [cloudProfile, setCloudProfile] = useState(
    () => account?.profile ?? null,
  );

  const isPlaying = phase === "playing";
  const isLowTime = mode === "time_attack" && timeLeft < 10;
  const showComboBadge = combo >= COMBO_DISPLAY_MIN;
  const displayProgress = account
    ? getDisplayProgress({ ...account, profile: cloudProfile })
    : { level: 1, xp: 0 };

  useEffect(() => {
    // Sync cached cloud profile when the account profile changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (account?.profile) setCloudProfile(account.profile);
  }, [account?.profile]);

  useEffect(() => {
    if (phase !== "gameover" || xpAppliedRef.current || !account) return;
    xpAppliedRef.current = true;

    if (!account.isLoggedIn || !account.profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedToCloud(false);
      return;
    }

    const profile = account.profile;
    const applySave = async () => {
      try {
        const saved = await saveProfileAfterGame(profile, score);
        setCloudProfile(saved);
        if (saved.persisted) {
          // Zapis w chmurze potwierdzony — pokazujemy zdobyte XP i level-up.
          setXpEarned(saved.xpEarned);
          if (saved.leveledUp) setShowLevelUpOverlay(true);
          setSavedToCloud(true);
          setSaveError(null);
        } else {
          // Zapis do DB się nie powiódł (funkcja nie rzuca wyjątku) — nie udajemy,
          // że XP trafiło do chmury.
          setSaveError("Nie udało się zapisać XP w chmurze. Spróbuj ponownie.");
          setSavedToCloud(false);
          setXpEarned(0);
        }
      } catch {
        setSaveError("Nie udało się zapisać XP w chmurze. Spróbuj ponownie.");
        setSavedToCloud(false);
        setXpEarned(0);
      }
    };

    void applySave();
  }, [phase, score, account]);

  useEffect(() => {
    if (!showLevelUpOverlay) return;
    const id = window.setTimeout(() => setShowLevelUpOverlay(false), 3500);
    return () => window.clearTimeout(id);
  }, [showLevelUpOverlay]);

  useEffect(() => {
    if (flash === "none") return;
    const id = window.setTimeout(() => setFlash("none"), FLASH_MS);
    return () => window.clearTimeout(id);
  }, [flash]);

  useEffect(() => {
    if (!isPlaying) return;

    if (mode === "time_attack") {
      const timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase("gameover");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => window.clearInterval(timer);
    }

    if (mode === "marathon") {
      const timer = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => window.clearInterval(timer);
    }

    return undefined;
  }, [isPlaying, mode]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const startGame = useCallback(() => {
    xpAppliedRef.current = false;
    setSavedToCloud(false);
    setSaveError(null);
    setShowLevelUpOverlay(false);
    setScore(0);
    setCombo(0);
    setTimeLeft(TIME_ATTACK_SECONDS);
    setElapsedTime(0);
    setQuestionsAnswered(0);
    setPhase("playing");
    setFlash("none");
    setScoreAnimating(false);
    setShake(false);
    setLastPointsGain(null);
    setXpEarned(0);
  }, []);

  const returnToStart = useCallback(() => {
    setPhase("start");
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const triggerCorrect = useCallback(() => {
    setFlash("correct");
    setScoreAnimating(true);
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const triggerWrong = useCallback(() => {
    setFlash("wrong");
    setShake(true);
  }, []);

  const finishMarathonIfNeeded = useCallback(
    (answered: number) => {
      if (mode === "marathon" && answered >= MARATHON_QUESTION_COUNT) {
        setPhase("gameover");
      }
    },
    [mode],
  );

  const registerCorrect = useCallback(
    (advance: () => void) => {
      if (phase !== "playing") return;
      const nextCombo = combo + 1;
      const pointsEarned = BASE_POINTS * nextCombo;
      setCombo(nextCombo);
      setScore((prev) => prev + pointsEarned);
      setLastPointsGain(pointsEarned);
      setQuestionsAnswered((prev) => {
        const next = prev + 1;
        finishMarathonIfNeeded(next);
        return next;
      });
      advance();
      triggerCorrect();
    },
    [phase, combo, triggerCorrect, finishMarathonIfNeeded],
  );

  const registerWrong = useCallback(
    (advance: () => void) => {
      if (phase !== "playing") return;
      setCombo(0);
      setLastPointsGain(null);
      triggerWrong();

      if (mode === "survival") {
        setPhase("gameover");
        return;
      }

      if (mode === "time_attack") {
        advance();
        return;
      }

      setQuestionsAnswered((prev) => {
        const next = prev + 1;
        finishMarathonIfNeeded(next);
        return next;
      });
      advance();
    },
    [phase, mode, triggerWrong, finishMarathonIfNeeded],
  );

  return {
    mode,
    account,
    accountLoading,
    path,
    pathReady,
    pathLabel,
    questionTrack,
    questionTrackLabel: questionTrackLabel(questionTrack),
    phase,
    score,
    timeLeft,
    elapsedTime,
    questionsAnswered,
    marathonTotal: MARATHON_QUESTION_COUNT,
    combo,
    flash,
    scoreAnimating,
    setScoreAnimating,
    shake,
    setShake,
    showLevelUpOverlay,
    lastPointsGain,
    savedToCloud,
    saveError,
    xpEarned,
    cloudProfile,
    displayProgress,
    isPlaying,
    isLowTime,
    showComboBadge,
    startGame,
    returnToStart,
    registerCorrect,
    registerWrong,
  };
}
