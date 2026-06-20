/** Aktualna ścieżka nauki — wybór w pasku nawigacji (SP lub szkoła średnia). */
export type LearningPath = "sp" | "srednia";

export type PathGroup = "sp" | "liceum" | "technikum" | "zawodowa";

/** Konkretne klasy w danych zadań / minigier (nie wybierane w UI). */
export type LegacyClassPath =
  | `klasa-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  | `liceum-${1 | 2 | 3 | 4}`
  | `technikum-${1 | 2 | 3 | 4 | 5}`
  | `zawodowa-${1 | 2 | 3 | 4 | 5}`;

/** Ścieżka pytań w generatorze. */
export type QuestionTrack = "podstawowa" | "egzamin-8-klasisty" | "matura";

export type PathOption = {
  value: LearningPath;
  label: string;
};

export const LEARNING_PATHS: readonly LearningPath[] = ["sp", "srednia"] as const;

export const PATH_OPTIONS: readonly PathOption[] = [
  { value: "sp", label: "Szkoła podstawowa" },
  { value: "srednia", label: "Szkoła średnia" },
] as const;

const STORAGE_KEY = "szybka-matma-learning-path";
const LEGACY_STORAGE_KEY = "szybka-matma-school-class";
const DEFAULT_PATH: LearningPath = "sp";

const PATH_LABELS: Record<LearningPath, string> = {
  sp: "Szkoła podstawowa",
  srednia: "Szkoła średnia",
};

const PATH_SHORT_LABELS: Record<LearningPath, string> = {
  sp: "SP",
  srednia: "Śr.",
};

export function isLearningPath(value: string): value is LearningPath {
  return value === "sp" || value === "srednia";
}

/** Mapuje starą wartość (klasa / liceum / technikum) na SP lub średnią. */
export function normalizeLearningPath(raw: string): LearningPath | null {
  if (isLearningPath(raw)) return raw;
  if (raw === "matura") return "srednia";
  if (raw.startsWith("klasa-")) return "sp";
  if (
    raw.startsWith("liceum-") ||
    raw.startsWith("technikum-") ||
    raw.startsWith("zawodowa-")
  ) {
    return "srednia";
  }
  return null;
}

/** Poziom klasy SP do trudności minigier (null = szkoła średnia / matura). */
export function spClassLevel(path: LearningPath): number | null {
  if (path === "sp") return 8;
  return null;
}

export function pathGroup(path: LearningPath): PathGroup {
  return path === "sp" ? "sp" : "liceum";
}

export function learningPathLabel(path: LearningPath): string {
  return PATH_LABELS[path];
}

export function learningPathShortLabel(path: LearningPath): string {
  return PATH_SHORT_LABELS[path];
}

export function questionTrackForPath(path: LearningPath): QuestionTrack {
  return path === "sp" ? "egzamin-8-klasisty" : "matura";
}

export function questionTrackLabel(track: QuestionTrack): string {
  if (track === "matura") return "Matura";
  if (track === "egzamin-8-klasisty") return "Egzamin 8-klasisty";
  return "Szkoła podstawowa";
}

export function loadLearningPath(): LearningPath {
  if (typeof window === "undefined") return DEFAULT_PATH;

  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const migrated = normalizeLearningPath(current);
      if (migrated) {
        if (migrated !== current) saveLearningPath(migrated);
        return migrated;
      }
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = normalizeLearningPath(legacy);
      if (migrated) {
        saveLearningPath(migrated);
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_PATH;
}

export function saveLearningPath(path: LearningPath): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, path);
}

/** Skrót dopasowania po torze pytań (egzamin 8-kl. / matura). */
export type QuestionTrackMatcher = "egzamin-8" | "matura";

/** Dopasowanie ścieżki do listy konkretnych klas, grup lub torów w danych. */
export type PathMatcher =
  | LearningPath
  | PathGroup
  | QuestionTrackMatcher
  | LegacyClassPath;

function matcherMatchesPath(path: LearningPath, item: PathMatcher): boolean {
  if (item === path) return true;

  if (path === "sp") {
    if (item === "sp") return true;
    if (typeof item === "string" && item.startsWith("klasa-")) return true;
    if (item === "egzamin-8") return true;
    return false;
  }

  if (item === "matura") return true;
  if (item === "liceum" || item === "technikum" || item === "zawodowa") {
    return true;
  }
  if (typeof item === "string") {
    if (item.startsWith("liceum-")) return true;
    if (item.startsWith("technikum-")) return true;
    if (item.startsWith("zawodowa-")) return true;
  }
  return false;
}

export function matchesLearningPath(
  path: LearningPath,
  allowed: readonly PathMatcher[],
): boolean {
  return allowed.some((item) => matcherMatchesPath(path, item));
}
