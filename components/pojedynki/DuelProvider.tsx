"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import type { LearningPath } from "@/lib/learning-path";
import {
  DEFAULT_DUEL_LENGTH,
  DEFAULT_DUEL_SLUG,
  type DuelLength,
} from "@/lib/pojedynki/duel-config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const NAME_STORAGE_KEY = "szybka-matma-pojedynki-nick";

function randomGuestName(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `Gracz ${n}`;
}

type DuelContextValue = {
  /** Wyświetlana nazwa lokalnego gracza (persystowana w localStorage). */
  playerName: string;
  setPlayerName: (name: string) => void;
  /** Slug wybranej minigry. */
  slug: string;
  setSlug: (slug: string) => void;
  /** Długość pojedynku (liczba pytań). */
  length: DuelLength;
  setLength: (length: DuelLength) => void;
  /** Aktualna ścieżka nauki (z globalnego providera, read-only tutaj). */
  path: LearningPath;
  ready: boolean;
};

const DuelContext = createContext<DuelContextValue | null>(null);

/**
 * Własny provider obszaru pojedynków. Trzyma stan lokalny feature'u (nick,
 * wybrana minigra, długość) NIE dotykając globalnych providerów aplikacji.
 */
export function DuelProvider({ children }: { children: ReactNode }) {
  const { path, ready: pathReady } = useLearningPath();
  const [playerName, setPlayerNameState] = useState("Gracz");
  const [slug, setSlug] = useState<string>(DEFAULT_DUEL_SLUG);
  const [length, setLength] = useState<DuelLength>(DEFAULT_DUEL_LENGTH);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(NAME_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const initial = stored?.trim() || randomGuestName();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerNameState(initial);
    setReady(true);
  }, []);

  const setPlayerName = useCallback((name: string) => {
    const clean = name.trim().slice(0, 24) || randomGuestName();
    setPlayerNameState(clean);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, clean);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      playerName,
      setPlayerName,
      slug,
      setSlug,
      length,
      setLength,
      path,
      ready: ready && pathReady,
    }),
    [playerName, setPlayerName, slug, length, path, ready, pathReady],
  );

  return <DuelContext.Provider value={value}>{children}</DuelContext.Provider>;
}

export function useDuel(): DuelContextValue {
  const ctx = useContext(DuelContext);
  if (!ctx) throw new Error("useDuel must be used within DuelProvider");
  return ctx;
}
