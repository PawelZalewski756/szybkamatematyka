"use client";

import {
  clearLearningPath,
  hasStoredLearningPath,
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
  clearPath: () => void;
  hasPathSelection: boolean;
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
  const hasPathSelection = useSyncExternalStore(
    subscribeLearningPath,
    hasStoredLearningPath,
    () => false,
  );

  const setPath = useCallback((next: LearningPath) => saveLearningPath(next), []);
  const clearPath = useCallback(() => clearLearningPath(), []);

  const value = useMemo(
    () => ({
      path,
      setPath,
      clearPath,
      hasPathSelection,
      ready: true,
    }),
    [path, setPath, clearPath, hasPathSelection],
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
