"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  learningPathLabel,
  questionTrackForPath,
  questionTrackLabel,
} from "@/lib/learning-path";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  fetchChallengeCompletion,
  recordChallengeCompletion,
} from "@/lib/supabase/daily-challenge";
import {
  awardDailyChallenge,
  calculateStreak,
  ensureUserProfile,
  todayDateString,
  type Profile,
} from "@/lib/supabase/profiles";
import {
  challengeXpReward,
  generateDailyChallenge,
} from "@/lib/wyzwania/daily-challenge";
import {
  applyLocalCompletion,
  effectiveStreak,
  isCompletedToday,
  loadChallengeProgress,
  mirrorCloudCompletion,
} from "@/lib/wyzwania/storage";
import type {
  ChallengeReward,
  DailyChallenge,
} from "@/lib/wyzwania/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChallengeSource = "cloud" | "local";

type DailyChallengeState = {
  loading: boolean;
  challenge: DailyChallenge | null;
  source: ChallengeSource;
  isLoggedIn: boolean;
  completed: boolean;
  streak: number;
  bestStreak: number;
  reward: ChallengeReward | null;
};

const INITIAL_STATE: DailyChallengeState = {
  loading: true,
  challenge: null,
  source: "local",
  isLoggedIn: false,
  completed: false,
  streak: 0,
  bestStreak: 0,
  reward: null,
};

export function useDailyChallenge() {
  const { path, ready: pathReady } = useLearningPath();
  const track = questionTrackForPath(path);

  const [state, setState] = useState<DailyChallengeState>(INITIAL_STATE);
  const profileRef = useRef<Profile | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathReady) return;
    let cancelled = false;

    const today = todayDateString();
    const challenge = generateDailyChallenge(track, today);

    const loadLocal = (userId: string | null, isLoggedIn: boolean) => {
      const prog = loadChallengeProgress(userId);
      const done = isCompletedToday(prog);
      if (cancelled) return;
      setState({
        loading: false,
        challenge,
        source: "local",
        isLoggedIn,
        completed: done,
        streak: effectiveStreak(prog.lastCompletedDate, prog.streak),
        bestStreak: prog.bestStreak,
        reward: done ? prog.lastReward : null,
      });
    };

    const init = async () => {
      const supabase = getSupabaseOrNull();
      if (!supabase) {
        loadLocal(null, false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          loadLocal(null, false);
          return;
        }

        userIdRef.current = user.id;
        const profile = await ensureUserProfile(user);
        profileRef.current = profile;

        const completion = await fetchChallengeCompletion(user.id, today);
        const localMirror = loadChallengeProgress(user.id);
        const completedLocal = isCompletedToday(localMirror);
        if (cancelled) return;

        const completed = Boolean(completion) || completedLocal;
        const reward: ChallengeReward | null = completion
          ? {
              xp: completion.xpAwarded,
              correct: completion.correctCount,
              total: completion.totalCount,
              streak: completion.streakAfter,
              leveledUp: false,
            }
          : completedLocal
            ? localMirror.lastReward
            : null;

        setState({
          loading: false,
          challenge,
          source: "cloud",
          isLoggedIn: true,
          completed,
          streak: effectiveStreak(profile.lastPlayedDate, profile.streak),
          bestStreak: localMirror.bestStreak,
          reward,
        });
      } catch {
        loadLocal(null, false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [pathReady, track]);

  const complete = useCallback(
    async (correct: number, total: number): Promise<ChallengeReward> => {
      const today = todayDateString();
      const profile = profileRef.current;
      const userId = userIdRef.current;

      // Tryb chmurowy: zalogowany gracz + dostępny profil.
      if (profile && userId) {
        // Ponowne ukończenie (druga karta, odświeżenie w trakcie) nie może
        // drugi raz dodać XP - wracamy z zapisanym wcześniej wynikiem.
        const existing = await fetchChallengeCompletion(userId, today).catch(
          () => null,
        );
        if (existing) {
          const already: ChallengeReward = {
            xp: existing.xpAwarded,
            correct: existing.correctCount,
            total: existing.totalCount,
            streak: existing.streakAfter,
            leveledUp: false,
          };
          profileRef.current = {
            ...profile,
            xp: profile.xp + existing.xpAwarded,
            streak: existing.streakAfter,
            lastPlayedDate: today,
          };
          setState((prev) => ({
            ...prev,
            completed: true,
            reward: already,
          }));
          return already;
        }

        const preview = calculateStreak(profile.lastPlayedDate, profile.streak);
        const xp = challengeXpReward(correct, preview.streak);

        // Najpierw claim w bazie: unikalny klucz (user_id, data) rozstrzyga,
        // czy XP w ogóle wolno przyznać. Dzięki temu dwie karty nie naliczą
        // nagrody dwa razy.
        const claim = await recordChallengeCompletion(userId, {
          date: today,
          correctCount: correct,
          totalCount: total,
          xpAwarded: xp,
          streakAfter: preview.streak,
        });

        if (claim === "failed") {
          throw new Error(
            "Nie udało się zapisać ukończenia wyzwania. Spróbuj ponownie.",
          );
        }

        if (claim === "existing") {
          const stored = await fetchChallengeCompletion(userId, today).catch(
            () => null,
          );
          const alreadyDone: ChallengeReward = {
            xp: stored?.xpAwarded ?? 0,
            correct: stored?.correctCount ?? correct,
            total: stored?.totalCount ?? total,
            streak: stored?.streakAfter ?? preview.streak,
            leveledUp: false,
          };
          mirrorCloudCompletion(userId, alreadyDone);
          setState((prev) => ({
            ...prev,
            completed: true,
            reward: alreadyDone,
          }));
          return alreadyDone;
        }

        const saved = await awardDailyChallenge(profile, xp);
        profileRef.current = saved;

        const reward: ChallengeReward = {
          xp: saved.xpEarned,
          correct,
          total,
          streak: saved.streak,
          leveledUp: saved.leveledUp,
        };

        mirrorCloudCompletion(userId, reward);

        setState((prev) => ({
          ...prev,
          completed: true,
          streak: effectiveStreak(saved.lastPlayedDate, saved.streak),
          bestStreak: Math.max(prev.bestStreak, saved.streak),
          reward,
        }));
        return reward;
      }

      // Tryb lokalny (gość / brak Supabase).
      const prog = applyLocalCompletion(userId, correct, total);
      const reward = prog.lastReward ?? {
        xp: 0,
        correct,
        total,
        streak: prog.streak,
        leveledUp: false,
      };
      setState((prev) => ({
        ...prev,
        completed: true,
        streak: effectiveStreak(prog.lastCompletedDate, prog.streak),
        bestStreak: prog.bestStreak,
        reward,
      }));
      return reward;
    },
    [],
  );

  return {
    ...state,
    track,
    pathLabel: learningPathLabel(path),
    trackLabel: questionTrackLabel(track),
    complete,
  };
}
