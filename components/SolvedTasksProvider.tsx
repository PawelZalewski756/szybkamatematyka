"use client";

import {
  loadSolvedTaskIds,
  markTaskSolved,
  recordTaskResult,
  SOLVED_TASKS_UPDATED_EVENT,
  type SolvedTasksUpdatedDetail,
} from "@/lib/baza-zadan/solved-tasks";
import { getSupabase } from "@/lib/supabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SolvedTasksContextValue = {
  ready: boolean;
  solvedIds: ReadonlySet<string>;
  isSolved: (taskId: string) => boolean;
  markSolved: (taskId: string) => void;
  /**
   * Zapisuje wynik podejścia do zadania. Błędna odpowiedź oznacza zadanie
   * „do powtórki" (poprawna jest no-op - patrz `recordTaskResult`). Działa
   * spójnie dla gościa i zalogowanego - używa aktualnego `userId` providera.
   */
  recordResult: (taskId: string, isCorrect: boolean) => void;
  solvedCount: number;
};

const SolvedTasksContext = createContext<SolvedTasksContextValue | null>(null);

export function SolvedTasksProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<ReadonlySet<string>>(new Set());
  const [ready, setReady] = useState(false);

  const reload = useCallback((uid: string | null) => {
    setSolvedIds(loadSolvedTaskIds(uid));
  }, []);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      // No Supabase configured - fall back to local solved ids.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reload(null);
      setReady(true);
      return;
    }

    const syncFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      reload(uid);
      setReady(true);
    };

    void syncFromSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      reload(uid);
    });

    return () => subscription.unsubscribe();
  }, [reload]);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SolvedTasksUpdatedDetail>).detail;
      if (detail?.solvedIds) {
        setSolvedIds(new Set(detail.solvedIds));
        return;
      }
      reload(userId);
    };

    window.addEventListener(SOLVED_TASKS_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(SOLVED_TASKS_UPDATED_EVENT, onUpdate);
  }, [reload, userId]);

  const markSolved = useCallback(
    (taskId: string) => {
      const next = markTaskSolved(taskId, userId);
      setSolvedIds(new Set(next));
    },
    [userId],
  );

  const isSolved = useCallback(
    (taskId: string) => solvedIds.has(taskId),
    [solvedIds],
  );

  const recordResult = useCallback(
    (taskId: string, isCorrect: boolean) => {
      recordTaskResult(taskId, isCorrect, userId);
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      ready,
      solvedIds,
      isSolved,
      markSolved,
      recordResult,
      solvedCount: solvedIds.size,
    }),
    [ready, solvedIds, isSolved, markSolved, recordResult],
  );

  return (
    <SolvedTasksContext.Provider value={value}>
      {children}
    </SolvedTasksContext.Provider>
  );
}

export function useSolvedTasks(): SolvedTasksContextValue {
  const ctx = useContext(SolvedTasksContext);
  if (!ctx) {
    throw new Error("useSolvedTasks must be used within SolvedTasksProvider");
  }
  return ctx;
}
