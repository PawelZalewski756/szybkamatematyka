import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  markLocal: vi.fn(),
  markDb: vi.fn(),
  ensureProfile: vi.fn(),
  awardXp: vi.fn(),
}));

vi.mock("@/lib/baza-zadan/solved-tasks", () => ({
  markTaskSolved: mocks.markLocal,
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseOrNull: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "user-1", email: "a@b.pl" } } },
      }),
    },
  }),
}));

vi.mock("@/lib/supabase/solved-tasks", () => ({
  markTaskSolved: mocks.markDb,
}));

vi.mock("@/lib/supabase/profiles", () => ({
  ensureUserProfile: mocks.ensureProfile,
  awardArenaXp: mocks.awardXp,
}));

import { recordTaskCompletion } from "@/lib/progress/task-completion";

beforeEach(() => {
  mocks.markLocal.mockReset();
  mocks.markDb.mockReset();
  mocks.ensureProfile.mockReset();
  mocks.awardXp.mockReset();
  mocks.ensureProfile.mockResolvedValue({ id: "user-1" });
  mocks.awardXp.mockResolvedValue({ xpEarned: 10 });
});

describe("recordTaskCompletion", () => {
  it("zapisuje poprawne rozwiązanie i nalicza XP tylko za pierwszy raz", async () => {
    mocks.markDb.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const first = await recordTaskCompletion({
      taskId: "task-1",
      source: "baza-zadan",
      isCorrect: true,
      xpReward: 10,
    });
    expect(first).toMatchObject({ first: true, xp: 10, userId: "user-1" });
    expect(mocks.markLocal).toHaveBeenCalledWith("task-1", "user-1");
    expect(mocks.markDb).toHaveBeenCalledWith("user-1", "task-1", "baza-zadan");
    expect(mocks.awardXp).toHaveBeenCalledTimes(1);

    const second = await recordTaskCompletion({
      taskId: "task-1",
      source: "baza-zadan",
      isCorrect: true,
      xpReward: 10,
    });
    expect(second).toMatchObject({ first: false, xp: 0 });
    expect(mocks.awardXp).toHaveBeenCalledTimes(1);
  });

  it("błędna odpowiedź nie jest zapisywana jako rozwiązanie", async () => {
    const result = await recordTaskCompletion({
      taskId: "task-2",
      source: "cke",
      isCorrect: false,
      xpReward: 10,
    });
    expect(result).toMatchObject({ first: false, xp: 0 });
    expect(mocks.markLocal).not.toHaveBeenCalled();
    expect(mocks.markDb).not.toHaveBeenCalled();
    expect(mocks.awardXp).not.toHaveBeenCalled();
  });
});
