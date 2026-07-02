"use client";

import {
  getLearningPathServerSnapshot,
  loadLearningPath,
  saveLearningPath,
  subscribeLearningPath,
  type LearningPath,
} from "@/lib/learning-path";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type LearningPathContextValue = {
  path: LearningPath;
  setPath: (path: LearningPath) => void;
  /** Zawsze true — ścieżka synchronizowana przez useSyncExternalStore (bez mismatchu SSR). */
  ready: boolean;
};

const LearningPathContext = createContext<LearningPathContextValue | null>(
  null,
);

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const path = useSyncExternalStore(
    subscribeLearningPath,
    loadLearningPath,
    getLearningPathServerSnapshot,
  );

  const setPath = useCallback((next: LearningPath) => {
    saveLearningPath(next);
  }, []);

  const value = useMemo(
    () => ({ path, setPath, ready: true }),
    [path, setPath],
  );

  return (
    <LearningPathContext.Provider value={value}>
      {children}
    </LearningPathContext.Provider>
  );
}

export function useLearningPath(): LearningPathContextValue {
  const ctx = useContext(LearningPathContext);
  if (!ctx) {
    throw new Error("useLearningPath must be used within LearningPathProvider");
  }
  return ctx;
}
