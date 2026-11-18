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
      return { first: false, xp: 0, userId };
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
