import type { LearningPath } from "@/lib/learning-path";
import type {
  DuelConfig,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { generateDuelQuestions } from "@/lib/pojedynki/duel-questions";
import { mulberry32 } from "@/lib/pojedynki/duel-rng";
import { pointsForCombo } from "@/lib/pojedynki/duel-engine";

/**
 * Przenośny „wyzwanie-kod" pojedynku async/ghost - w pełni offline. Zawiera
 * konfigurację (seed/slug/path/liczbę pytań) ORAZ wynik autora, więc rywal
 * może zagrać ten sam zestaw i porównać się bez żadnego backendu.
 */
export type DuelChallengePayload = {
  v: 1;
  config: DuelConfig;
  hostName: string;
  hostResult: DuelResult;
};

const CHALLENGE_PREFIX = "SMD1.";
const STORAGE_KEY = "szybka-matma-pojedynki-challenges";
const MAX_STORED = 12;

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/** Koduje wyzwanie do przenośnego kodu (do skopiowania / w URL). */
export function encodeChallenge(payload: DuelChallengePayload): string {
  return CHALLENGE_PREFIX + base64UrlEncode(JSON.stringify(payload));
}

/** Dekoduje przenośny kod wyzwania. Zwraca null gdy kod jest niepoprawny. */
export function decodeChallenge(code: string): DuelChallengePayload | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(CHALLENGE_PREFIX)) return null;
  try {
    const json = base64UrlDecode(trimmed.slice(CHALLENGE_PREFIX.length));
    const parsed = JSON.parse(json) as DuelChallengePayload;
    if (parsed.v !== 1 || !parsed.config || !parsed.hostResult) return null;
    return parsed;
  } catch {
    return null;
  }
}

type StoredChallenge = {
  code: string;
  slug: string;
  hostName: string;
  hostScore: number;
  createdAt: number;
};

/** Zapisuje utworzone wyzwanie lokalnie (historia do ponownego udostępnienia). */
export function rememberChallenge(payload: DuelChallengePayload): void {
  if (typeof window === "undefined") return;
  try {
    const entry: StoredChallenge = {
      code: encodeChallenge(payload),
      slug: payload.config.slug,
      hostName: payload.hostName,
      hostScore: payload.hostResult.score,
      createdAt: Date.now(),
    };
    const existing = loadStoredChallenges();
    const next = [entry, ...existing].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / serialization errors */
  }
}

/** Wczytuje historię lokalnych wyzwań. */
export function loadStoredChallenges(): StoredChallenge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredChallenge[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type BotLevel = "easy" | "medium" | "hard";

export const BOT_PRESETS: Record<
  BotLevel,
  { name: string; accuracy: number; perQuestionMs: number; label: string }
> = {
  easy: { name: "Bot Żółw", accuracy: 0.55, perQuestionMs: 4200, label: "Łatwy" },
  medium: { name: "Bot Lis", accuracy: 0.75, perQuestionMs: 3000, label: "Średni" },
  hard: { name: "Bot Sokół", accuracy: 0.9, perQuestionMs: 1900, label: "Trudny" },
};

/**
 * Symuluje wynik bota dla danej konfiguracji - deterministycznie z seeda
 * (ten sam pojedynek → ten sam bot). Bot „rozwiązuje" te same pytania z danym
 * prawdopodobieństwem trafienia, a punkty liczone są tą samą formułą combo.
 */
export function simulateBotResult(
  config: DuelConfig,
  level: BotLevel,
): DuelResult {
  const preset = BOT_PRESETS[level];
  const questions = generateDuelQuestions(config);
  const rng = mulberry32((config.seed ^ 0x5bd1e995) >>> 0);

  let score = 0;
  let correct = 0;
  let combo = 0;
  let durationMs = 0;

  for (let i = 0; i < questions.length; i += 1) {
    const hit = rng() < preset.accuracy;
    // Czas reakcji bota - wokół presetu, z deterministycznym rozrzutem.
    durationMs += preset.perQuestionMs * (0.7 + rng() * 0.6);
    if (hit) {
      combo += 1;
      score += pointsForCombo(combo);
      correct += 1;
    } else {
      combo = 0;
    }
  }

  return {
    score,
    correct,
    total: questions.length,
    durationMs: Math.round(durationMs),
  };
}

export type { LearningPath };
