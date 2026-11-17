import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/subscription/server-auth", () => ({
  verifyTaskAssistRequest: vi.fn(),
}));

import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";
import { POST } from "@/app/api/trening/archive-solutions/route";

const mockAuth = vi.mocked(verifyTaskAssistRequest);

function request(body: unknown): Request {
  return new Request("http://localhost/api/trening/archive-solutions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/trening/archive-solutions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("odmawia dostępu bez zalogowania", async () => {
    mockAuth.mockResolvedValue({
      ok: false,
      status: 401,
      error: "Brak tokenu.",
    });

    const response = await POST(request({ sheetId: "arkusz-m15-maj" }));

    expect(response.status).toBe(401);
  });

  it("odmawia dostępu bez planu Pro", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: false });

    const response = await POST(request({ sheetId: "arkusz-m15-maj" }));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toContain("Pro");
  });

  it("zwraca 404 dla nieznanego arkusza", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: true });

    const response = await POST(request({ sheetId: "arkusz-nie-istnieje" }));

    expect(response.status).toBe(404);
  });

  it("zwraca 400 dla niepoprawnego body", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: true });

    const response = await POST(request({ sheetId: "" }));

    expect(response.status).toBe(400);
  });

  it("zwraca klucz i kroki dla Pro", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: true });

    const response = await POST(request({ sheetId: "arkusz-m15-maj" }));
    const data = (await response.json()) as {
      answers: Record<string, string | null>;
      solutions: Record<string, string>;
      steps: Record<string, string[]>;
    };

    expect(response.status).toBe(200);
    const ids = Object.keys(data.solutions);
    expect(ids.length).toBeGreaterThan(0);
    expect(Object.keys(data.answers).sort()).toEqual([...ids].sort());

    for (const id of ids) {
      expect(data.answers[id] === null || /^[A-D]$/.test(data.answers[id] ?? "")).toBe(
        true,
      );
      expect(Array.isArray(data.steps[id])).toBe(true);
    }

    expect(
      Object.values(data.solutions).some((solution) => solution.trim().length > 0),
    ).toBe(true);
  });
});
