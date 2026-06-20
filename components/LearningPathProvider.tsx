"use client";

import {
  loadLearningPath,
  saveLearningPath,
  type LearningPath,
} from "@/lib/learning-path";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LearningPathContextValue = {
  path: LearningPath;
  setPath: (path: LearningPath) => void;
  ready: boolean;
};

const LearningPathContext = createContext<LearningPathContextValue | null>(
  null,
);

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const [path, setPathState] = useState<LearningPath>("sp");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage once on mount (intentional client-only sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPathState(loadLearningPath());
    setReady(true);
  }, []);

  const setPath = useCallback((next: LearningPath) => {
    saveLearningPath(next);
    setPathState(next);
  }, []);

  const value = useMemo(
    () => ({ path, setPath, ready }),
    [path, setPath, ready],
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

