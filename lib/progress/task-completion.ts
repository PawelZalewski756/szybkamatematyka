import {
  markTaskSolved as markTaskSolvedLocal,
} from "@/lib/baza-zadan/solved-tasks";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  markTaskSolved as markTaskSolvedDb,
  type SolvedTaskSource,
} from "@/lib/supabase/solved-tasks";
import {
  awardArenaXp,
  ensureUserProfile,
} from "@/lib/supabase/profiles";

export type { SolvedTaskSource };

export type TaskCompletionInput = {
  taskId: string;
  source: SolvedTaskSource;
  isCorrect: boolean;
  /** XP naliczane tylko za pierwsze poprawne rozwiązanie. 0 = bez XP. */
  xpReward?: number;
};

export type TaskCompletionResult = {
  first: boolean;
  xp: number;
  userId: string | null;
  /** Błąd zapisu do DB; lokalny zapis mógł się udać. */
  error?: string | null;
};

/**
 * Jedno wspólne miejsce zapisu rozwiązania zadania.
 *
 * - gość: zapis lokalny (bez XP),
 * - zalogowany: solved_tasks (dowolne źródło) + lokalny cache + XP za pierwsze
 *   poprawne rozwiązanie,
 * - każdy błąd zapisu jest logowany, ale nie wywala solvera.
 */
const inFlight = new Map<string, Promise<TaskCompletionResult>>();

function keyFor(userId: string | null, taskId: string): string {
  return `${userId ?? "guest"}:${taskId}`;
}

export function defaultXpForDifficulty(
  difficulty: "latwy" | "sredni" | "trudny" | null | undefined,
): number {
  if (difficulty === "trudny") return 20;
  if (difficulty === "sredni") return 15;
  return 10;
}

export async function recordTaskCompletion(
  input: TaskCompletionInput,
): Promise<TaskCompletionResult> {
  const supabase = getSupabaseOrNull();
  let userId: string | null = null;
  let user = null;

  if (supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      user = session?.user ?? null;
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
  }

  const key = keyFor(userId, input.taskId);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const run = (async (): Promise<TaskCompletionResult> => {
    // Błędna odpowiedź nie jest „rozwiązanym zadaniem” - trafia tylko do
    // powtórek przez recordResult w komponencie.
    if (!input.isCorrect) return { first: false, xp: 0, userId };

    // Lokalny zapis od razu - UI (Baza zadań, profile) widzi rozwiązanie
    // nawet jeśli DB jest chwilowo niedostępna.
    markTaskSolvedLocal(input.taskId, userId);

    if (!userId || !user) return { first: false, xp: 0, userId: null };

    let first = false;
    try {
      first = await markTaskSolvedDb(userId, input.taskId, input.source);
    } catch (error) {
      console.warn("[szybka-matma] recordTaskCompletion:", error);
      return {
        first: false,
        xp: 0,
        userId,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    if (!first || !input.isCorrect) {
      return { first, xp: 0, userId };
    }

    const xpReward = Math.max(0, Math.round(input.xpReward ?? 0));
    if (xpReward === 0) return { first, xp: 0, userId };

    try {
      const profile = await ensureUserProfile(user);
      if (!profile) return { first, xp: 0, userId };
      const updated = await awardArenaXp(profile, xpReward);
      return { first, xp: updated.xpEarned, userId };
    } catch (error) {
      console.warn("[szybka-matma] recordTaskCompletion XP:", error);
      return { first, xp: 0, userId };
    }
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, run);
  return run;
}


/**
 * Dosyła lokalne (gość / sprzed migracji) identyfikatory rozwiązań do bazy.
 * Nie nalicza XP — służy tylko do odzyskania historii, którą uczeń ma w
 * przeglądarce, a której nie było jeszcze w solved_tasks.
 */
export async function syncLocalSolvedTasks(
  userId: string,
  taskIds: readonly string[],
): Promise<number> {
  const supabase = getSupabaseOrNull();
  const unique = [...new Set(taskIds.filter(Boolean))];
  if (!supabase || unique.length === 0) return 0;

  let synced = 0;
  for (let index = 0; index < unique.length; index += 100) {
    const rows = unique.slice(index, index + 100).map((taskId) => ({
      user_id: userId,
      task_id: taskId,
      source: "trening" as const,
    }));
    const { error } = await supabase
      .from("solved_tasks")
      .upsert(rows, {
        onConflict: "user_id,task_id",
        ignoreDuplicates: true,
      });
    if (error) {
      console.warn("[szybka-matma] syncLocalSolvedTasks:", error);
      break;
    }
    synced += rows.length;
  }
  return synced;
}
