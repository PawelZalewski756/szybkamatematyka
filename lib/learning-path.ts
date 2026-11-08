/** Generalny poziom nauki wybierany przez użytkownika: SP albo szkoła średnia. */
export type LearningPath = "sp" | "srednia";

export type PathGroup = "sp" | "liceum" | "technikum" | "zawodowa";

/** Legacy values for specific classes; retained to normalize existing data. */
export type SchoolClassPath =
  | `klasa-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  | `liceum-${1 | 2 | 3 | 4}`
  | `technikum-${1 | 2 | 3 | 4 | 5}`
  | `zawodowa-${1 | 2 | 3 | 4 | 5}`;

/** @deprecated Użyj SchoolClassPath */
export type LegacyClassPath = SchoolClassPath;

/** Ścieżka pytań w generatorze. */
export type QuestionTrack = "podstawowa" | "egzamin-8-klasisty" | "matura";

export type SchoolClassOption = {
  value: SchoolClassPath;
  label: string;
};

export type SchoolClassGroup = {
  id: PathGroup;
  label: string;
  options: readonly SchoolClassOption[];
};

const SP_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const HS_YEARS = [1, 2, 3, 4] as const;
const TECH_YEARS = [1, 2, 3, 4, 5] as const;

export const SCHOOL_CLASS_GROUPS: readonly SchoolClassGroup[] = [
  {
    id: "sp",
    label: "Szkoła podstawowa",
    options: SP_CLASSES.map((n) => ({
      value: `klasa-${n}` as SchoolClassPath,
      label: `Klasa ${n}`,
    })),
  },
  {
    id: "liceum",
    label: "Liceum",
    options: HS_YEARS.map((n) => ({
      value: `liceum-${n}` as SchoolClassPath,
      label: `Liceum - klasa ${n}`,
    })),
  },
  {
    id: "technikum",
    label: "Technikum",
    options: TECH_YEARS.map((n) => ({
      value: `technikum-${n}` as SchoolClassPath,
      label: `Technikum - klasa ${n}`,
    })),
  },
  {
    id: "zawodowa",
    label: "Szkoła branżowa I stopnia",
    options: TECH_YEARS.map((n) => ({
      value: `zawodowa-${n}` as SchoolClassPath,
      label: `Branżówka - klasa ${n}`,
    })),
  },
] as const;

export const ALL_SCHOOL_CLASS_OPTIONS: readonly SchoolClassOption[] =
  SCHOOL_CLASS_GROUPS.flatMap((g) => g.options);

export const SCHOOL_LEVEL_OPTIONS: readonly {
  value: LearningPath;
  label: string;
}[] = [
  { value: "sp", label: "Szkoła podstawowa" },
  { value: "srednia", label: "Szkoła średnia" },
];

/** @deprecated Użyj SCHOOL_CLASS_GROUPS */
export type PathOption = { value: LearningPath; label: string };

/** @deprecated Użyj learningPathFromSchoolClass */
export const LEARNING_PATHS: readonly LearningPath[] = ["sp", "srednia"] as const;

/** @deprecated Użyj ALL_SCHOOL_CLASS_OPTIONS */
export const PATH_OPTIONS: readonly PathOption[] = [
  { value: "sp", label: "Szkoła podstawowa" },
  { value: "srednia", label: "Szkoła średnia" },
] as const;

const SCHOOL_CLASS_STORAGE_KEY = "szybka-matma-school-class";
const LEGACY_PATH_STORAGE_KEY = "szybka-matma-learning-path";
const PATH_CHANGE_EVENT = "szybka-matma-learning-path-change";

export const DEFAULT_SCHOOL_CLASS: SchoolClassPath = "klasa-8";
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

export function isSchoolClassPath(value: string): value is SchoolClassPath {
  return ALL_SCHOOL_CLASS_OPTIONS.some((o) => o.value === value);
}

/** Mapuje starą wartość (klasa / liceum / sp / srednia) na SP lub średnią. */
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

export function normalizeSchoolClass(raw: string): SchoolClassPath | null {
  if (isSchoolClassPath(raw)) return raw;
  if (raw === "sp") return DEFAULT_SCHOOL_CLASS;
  if (raw === "srednia" || raw === "matura") return "liceum-3";
  const fromLegacy = normalizeLearningPath(raw);
  if (fromLegacy === "sp") return DEFAULT_SCHOOL_CLASS;
  if (fromLegacy === "srednia") return "liceum-3";
  return null;
}

export function learningPathFromSchoolClass(
  schoolClass: SchoolClassPath,
): LearningPath {
  return normalizeLearningPath(schoolClass) ?? DEFAULT_PATH;
}

export function pathGroupFromSchoolClass(
  schoolClass: SchoolClassPath,
): PathGroup {
  if (schoolClass.startsWith("klasa-")) return "sp";
  if (schoolClass.startsWith("liceum-")) return "liceum";
  if (schoolClass.startsWith("technikum-")) return "technikum";
  return "zawodowa";
}

export function pathGroup(path: LearningPath): PathGroup {
  return path === "sp" ? "sp" : "liceum";
}

export function schoolClassLabel(schoolClass: SchoolClassPath): string {
  return (
    ALL_SCHOOL_CLASS_OPTIONS.find((o) => o.value === schoolClass)?.label ??
    schoolClass
  );
}

export function schoolClassShortLabel(schoolClass: SchoolClassPath): string {
  if (schoolClass.startsWith("klasa-")) {
    return `Kl. ${schoolClass.slice("klasa-".length)}`;
  }
  if (schoolClass.startsWith("liceum-")) {
    return `Liceum ${schoolClass.slice("liceum-".length)}`;
  }
  if (schoolClass.startsWith("technikum-")) {
    return `Techn. ${schoolClass.slice("technikum-".length)}`;
  }
  if (schoolClass.startsWith("zawodowa-")) {
    return `Br. ${schoolClass.slice("zawodowa-".length)}`;
  }
  return schoolClass;
}

/** Poziom klasy SP do trudności minigier (null = szkoła średnia / matura). */
export function spClassLevel(
  path: LearningPath,
  schoolClass?: SchoolClassPath | null,
): number | null {
  const resolved =
    schoolClass ??
    (typeof window !== "undefined" ? loadSchoolClass() : null);

  if (resolved?.startsWith("klasa-")) {
    const n = Number(resolved.slice("klasa-".length));
    if (n >= 1 && n <= 8) return n;
  }
  if (path === "sp") return 8;
  return null;
}

export function learningPathLabel(path: LearningPath): string {
  return PATH_LABELS[path];
}

export function learningPathShortLabel(path: LearningPath): string {
  return PATH_SHORT_LABELS[path];
}

/** Etykieta do UI - preferuje konkretną klasę. */
export function displayPathLabel(schoolClass: SchoolClassPath): string {
  return schoolClassLabel(schoolClass);
}

export function questionTrackForPath(path: LearningPath): QuestionTrack {
  return path === "sp" ? "egzamin-8-klasisty" : "matura";
}

export function questionTrackLabel(track: QuestionTrack): string {
  if (track === "matura") return "Matura";
  if (track === "egzamin-8-klasisty") return "Egzamin 8-klasisty";
  return "Szkoła podstawowa";
}

function migrateLegacyStorage(): SchoolClassPath | null {
  try {
    const legacyClass = localStorage.getItem(SCHOOL_CLASS_STORAGE_KEY);
    if (legacyClass) {
      const normalized = normalizeSchoolClass(legacyClass);
      if (normalized) return normalized;
    }

    const legacyPath = localStorage.getItem(LEGACY_PATH_STORAGE_KEY);
    if (legacyPath) {
      const normalized = normalizeSchoolClass(legacyPath);
      if (normalized) return normalized;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function hasStoredSchoolClass(): boolean {
  return hasStoredLearningPath();
}

export function hasStoredLearningPath(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      normalizeLearningPath(
        localStorage.getItem(SCHOOL_CLASS_STORAGE_KEY) ?? "",
      ) !== null ||
      normalizeLearningPath(
        localStorage.getItem(LEGACY_PATH_STORAGE_KEY) ?? "",
      ) !== null
    );
  } catch {
    return false;
  }
}

export function loadSchoolClass(): SchoolClassPath {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_CLASS;

  try {
    const current = localStorage.getItem(SCHOOL_CLASS_STORAGE_KEY);
    if (current) {
      const normalized = normalizeSchoolClass(current);
      if (normalized) {
        if (normalized !== current) saveSchoolClass(normalized);
        return normalized;
      }
    }

    const migrated = migrateLegacyStorage();
    if (migrated) {
      saveSchoolClass(migrated);
      return migrated;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_SCHOOL_CLASS;
}

export function getSchoolClassServerSnapshot(): SchoolClassPath {
  return DEFAULT_SCHOOL_CLASS;
}

export function loadLearningPath(): LearningPath {
  if (typeof window === "undefined") return DEFAULT_PATH;

  try {
    const storedLevel =
      localStorage.getItem(SCHOOL_CLASS_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_PATH_STORAGE_KEY);
    if (storedLevel) {
      const path = normalizeLearningPath(storedLevel);
      if (path) return path;
    }

    const migrated = migrateLegacyStorage();
    if (migrated) {
      const path = learningPathFromSchoolClass(migrated);
      saveLearningPath(path);
      return path;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_PATH;
}

export function getLearningPathServerSnapshot(): LearningPath {
  return learningPathFromSchoolClass(getSchoolClassServerSnapshot());
}

export function subscribeLearningPath(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => onChange();
  window.addEventListener(PATH_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PATH_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function notifyLearningPathChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PATH_CHANGE_EVENT));
}

export function saveSchoolClass(schoolClass: SchoolClassPath): void {
  saveLearningPath(learningPathFromSchoolClass(schoolClass));
}

/** @deprecated Zapisuj schoolClass - path jest pochodną. */
export function saveLearningPath(path: LearningPath): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHOOL_CLASS_STORAGE_KEY, path);
  localStorage.setItem(LEGACY_PATH_STORAGE_KEY, path);
  notifyLearningPathChange();
}

export function clearLearningPath(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCHOOL_CLASS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_PATH_STORAGE_KEY);
  notifyLearningPathChange();
}

/** Skrót dopasowania po torze pytań (egzamin 8-kl. / matura). */
export type QuestionTrackMatcher = "egzamin-8" | "matura";

/** Dopasowanie ścieżki do listy konkretnych klas, grup lub torów w danych. */
export type PathMatcher =
  | LearningPath
  | PathGroup
  | QuestionTrackMatcher
  | SchoolClassPath;

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
