"use client";

import {
  clearReviewFlag,
  loadReviewFlaggedIds,
  REVIEW_FLAGS_UPDATED_EVENT,
} from "@/lib/baza-zadan/solved-tasks";
import {
  createReviewItem,
  gradeReviewItem,
  isDue,
} from "@/lib/powtorki/scheduler";
import {
  loadSchedule,
  notifyScheduleUpdated,
  REVIEW_SCHEDULE_UPDATED_EVENT,
  saveSchedule,
  type ReviewScheduleUpdatedDetail,
} from "@/lib/powtorki/storage";
import {
  deleteReviewItem,
  fetchReviewSchedule,
  upsertReviewItem,
} from "@/lib/powtorki/supabase";
import type { ReviewItem, ReviewSchedule } from "@/lib/powtorki/types";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ReviewContextValue = {
  ready: boolean;
  items: ReviewItem[];
  dueItems: ReviewItem[];
  dueCount: number;
  totalCount: number;
  isInReview: (taskId: string) => boolean;
  getItem: (taskId: string) => ReviewItem | undefined;
  addToReview: (taskId: string) => void;
  removeFromReview: (taskId: string) => void;
  grade: (taskId: string, correct: boolean) => void;
};

const ReviewContext = createContext<ReviewContextValue | null>(null);

function itemRecency(item: ReviewItem): number {
  return Math.max(item.lastReviewedAt ?? 0, item.addedAt);
}

/** Łączy harmonogram lokalny i zdalny - wygrywa nowszy wpis (po dacie). */
function mergeSchedules(
  local: ReviewSchedule,
  remote: ReviewItem[],
): ReviewSchedule {
  const merged: ReviewSchedule = { ...local };
  for (const remoteItem of remote) {
    const localItem = merged[remoteItem.taskId];
    if (!localItem || itemRecency(remoteItem) > itemRecency(localItem)) {
      merged[remoteItem.taskId] = remoteItem;
    }
  }
  return merged;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<ReviewSchedule>({});
  const [ready, setReady] = useState(false);
  // „Teraz” trzymane w stanie (nie Date.now() w renderze) - odświeżane co minutę,
  // by zaległe powtórki pojawiały się w kolejce bez przeładowania strony.
  const [now, setNow] = useState(0);
  const userIdRef = useRef<string | null>(null);

  /** Zaciąga zadania oznaczone „do powtórki” do harmonogramu (due od razu). */
  const drainFlags = useCallback(
    (current: ReviewSchedule, uid: string | null): ReviewSchedule => {
      const flagged = loadReviewFlaggedIds(uid);
      if (flagged.size === 0) return current;

      let changed = false;
      const next = { ...current };
      const now = Date.now();
      for (const taskId of flagged) {
        if (!next[taskId]) {
          next[taskId] = createReviewItem(taskId, now);
          changed = true;
        }
        clearReviewFlag(taskId, uid);
      }
      return changed ? next : current;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const supabase = getSupabaseOrNull();
      let uid: string | null = null;

      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          uid = data.session?.user?.id ?? null;
        } catch {
          uid = null;
        }
      }

      if (cancelled) return;

      userIdRef.current = uid;

      let next = loadSchedule(uid);

      if (uid) {
        const remote = await fetchReviewSchedule(uid);
        if (cancelled) return;
        if (remote.length > 0) {
          next = mergeSchedules(next, remote);
        }
      }

      next = drainFlags(next, uid);

      if (cancelled) return;
      saveSchedule(next, uid);
      setSchedule(next);
      setNow(Date.now());
      setReady(true);
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [drainFlags]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onFlags = () => {
      const uid = userIdRef.current;
      setSchedule((prev) => {
        const next = drainFlags(prev, uid);
        if (next !== prev) {
          saveSchedule(next, uid);
        }
        return next;
      });
    };

    const onSchedule = (e: Event) => {
      const detail = (e as CustomEvent<ReviewScheduleUpdatedDetail>).detail;
      // Reaguj tylko na zmiany z innych kart/komponentów dla tego usera.
      if (detail?.userId === userIdRef.current) {
        setSchedule(loadSchedule(userIdRef.current));
      }
    };

    window.addEventListener(REVIEW_FLAGS_UPDATED_EVENT, onFlags);
    window.addEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, onSchedule);
    return () => {
      window.removeEventListener(REVIEW_FLAGS_UPDATED_EVENT, onFlags);
      window.removeEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, onSchedule);
    };
  }, [drainFlags]);

  const addToReview = useCallback(
    (taskId: string) => {
      const uid = userIdRef.current;
      setSchedule((prev) => {
        if (prev[taskId]) return prev;
        const item = createReviewItem(taskId);
        const next = { ...prev, [taskId]: item };
        saveSchedule(next, uid);
        notifyScheduleUpdated(uid);
        if (uid) void upsertReviewItem(uid, item).catch(() => {});
        return next;
      });
    },
    [],
  );

  const removeFromReview = useCallback((taskId: string) => {
    const uid = userIdRef.current;
    setSchedule((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      saveSchedule(next, uid);
      notifyScheduleUpdated(uid);
      if (uid) void deleteReviewItem(uid, taskId).catch(() => {});
      return next;
    });
  }, []);

  const grade = useCallback((taskId: string, correct: boolean) => {
    const uid = userIdRef.current;
    setSchedule((prev) => {
      const existing = prev[taskId] ?? createReviewItem(taskId);
      const updated = gradeReviewItem(existing, correct);
      const next = { ...prev, [taskId]: updated };
      saveSchedule(next, uid);
      notifyScheduleUpdated(uid);
      if (uid) void upsertReviewItem(uid, updated).catch(() => {});
      return next;
    });
  }, []);

  const items = useMemo(() => Object.values(schedule), [schedule]);

  const dueItems = useMemo(() => {
    return items
      .filter((item) => isDue(item, now))
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [items, now]);

  const isInReview = useCallback(
    (taskId: string) => Boolean(schedule[taskId]),
    [schedule],
  );

  const getItem = useCallback(
    (taskId: string) => schedule[taskId],
    [schedule],
  );

  const value = useMemo<ReviewContextValue>(
    () => ({
      ready,
      items,
      dueItems,
      dueCount: dueItems.length,
      totalCount: items.length,
      isInReview,
      getItem,
      addToReview,
      removeFromReview,
      grade,
    }),
    [
      ready,
      items,
      dueItems,
      isInReview,
      getItem,
      addToReview,
      removeFromReview,
      grade,
    ],
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReview(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error("useReview must be used within ReviewProvider");
  }
  return ctx;
}
