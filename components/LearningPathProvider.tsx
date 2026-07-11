"use client";

import {
  getSchoolClassServerSnapshot,
  learningPathFromSchoolClass,
  loadSchoolClass,
  saveSchoolClass,
  subscribeLearningPath,
  type LearningPath,
  type SchoolClassPath,
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
  schoolClass: SchoolClassPath;
  setSchoolClass: (schoolClass: SchoolClassPath) => void;
  /** @deprecated Użyj setSchoolClass */
  setPath: (path: LearningPath) => void;
  ready: boolean;
};

const LearningPathContext = createContext<LearningPathContextValue | null>(
  null,
);

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const schoolClass = useSyncExternalStore(
    subscribeLearningPath,
    loadSchoolClass,
    getSchoolClassServerSnapshot,
  );

  const setSchoolClass = useCallback((next: SchoolClassPath) => {
    saveSchoolClass(next);
  }, []);

  const setPath = useCallback((next: LearningPath) => {
    saveSchoolClass(next === "sp" ? "klasa-8" : "liceum-3");
  }, []);

  const value = useMemo(
    () => ({
      path: learningPathFromSchoolClass(schoolClass),
      schoolClass,
      setSchoolClass,
      setPath,
      ready: true,
    }),
    [schoolClass, setSchoolClass, setPath],
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
