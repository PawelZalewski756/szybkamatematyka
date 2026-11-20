export const WEEKLY_PLAN_STORAGE_KEY = "szybka-matma-weekly-plan-progress";
export const WEEKLY_PLAN_EVENT = "szybka-matma-weekly-plan-change";

export type WeeklyPlanProgress = {
  weekStart: string;
  completed: string[];
};

export function loadWeeklyPlanProgress(weekStart: string): WeeklyPlanProgress {
  if (typeof window === "undefined") {
    return { weekStart, completed: [] };
  }

  try {
    const raw = window.localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY);
    if (!raw) return { weekStart, completed: [] };

    const parsed = JSON.parse(raw) as Partial<WeeklyPlanProgress>;
    if (
      parsed?.weekStart !== weekStart ||
      !Array.isArray(parsed.completed) ||
      parsed.completed.some((id) => typeof id !== "string")
    ) {
      return { weekStart, completed: [] };
    }

    return { weekStart, completed: [...new Set(parsed.completed)] };
  } catch {
    return { weekStart, completed: [] };
  }
}

export function saveWeeklyPlanProgress(progress: WeeklyPlanProgress): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      WEEKLY_PLAN_STORAGE_KEY,
      JSON.stringify({
        weekStart: progress.weekStart,
        completed: [...new Set(progress.completed)],
      }),
    );
    window.dispatchEvent(new Event(WEEKLY_PLAN_EVENT));
  } catch {
    /* localStorage może być zablokowany - plan ma działać dalej bez zapisu. */
  }
}

export function toggleWeeklyPlanTask(
  weekStart: string,
  taskId: string,
): WeeklyPlanProgress {
  const current = loadWeeklyPlanProgress(weekStart);
  const completed = current.completed.includes(taskId)
    ? current.completed.filter((id) => id !== taskId)
    : [...current.completed, taskId];
  const next = { weekStart, completed };
  saveWeeklyPlanProgress(next);
  return next;
}
