import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/subscription/server-auth", () => ({
  verifyTaskAssistRequest: vi.fn(),
}));
vi.mock("@/lib/baza-zadan/catalog", () => ({
  getTaskById: vi.fn(),
}));

import { getTaskById } from "@/lib/baza-zadan/catalog";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";
import { POST } from "@/app/api/trening/task-solution/route";

const mockAuth = vi.mocked(verifyTaskAssistRequest);
const mockTask = vi.mocked(getTaskById);

function request(body: unknown): Request {
  return new Request("http://localhost/api/trening/task-solution", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/trening/task-solution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("odmawia dostępu bez planu Pro", async () => {
    mockAuth.mockResolvedValue({
      ok: true,
      user: {} as never,
      isPro: false,
    });

    const response = await POST(request({ taskId: "cke-mp-2026-maj-z01" }));
    expect(response.status).toBe(403);
  });

  it("zwraca 404 dla nieznanego zadania", async () => {
    mockAuth.mockResolvedValue({
      ok: true,
      user: {} as never,
      isPro: true,
    });
    mockTask.mockReturnValue(undefined);

    const response = await POST(request({ taskId: "nie-ma-takiego" }));
    expect(response.status).toBe(404);
  });

  it("zwraca rozwiązanie dla Pro", async () => {
    mockAuth.mockResolvedValue({
      ok: true,
      user: {} as never,
      isPro: true,
    });
    mockTask.mockReturnValue({
      explanation: "Odpowiedź: 2",
      solutionSteps: ["Krok 1", "Krok 2"],
    } as never);

    const response = await POST(request({ taskId: "cke-mp-2026-maj-z01" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      explanation: "Odpowiedź: 2",
      steps: ["Krok 1", "Krok 2"],
    });
  });
});
