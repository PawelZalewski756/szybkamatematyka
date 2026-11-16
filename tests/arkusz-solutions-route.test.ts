import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/subscription/server-auth", () => ({
  verifyTaskAssistRequest: vi.fn(),
}));
vi.mock("@/lib/supabase/baza-zadan", () => ({
  fetchZadaniaWithSolutions: vi.fn(),
}));
vi.mock("@/lib/gemini/format-solution", () => ({
  formatSolutionForDisplay: (value: string) => value,
}));

import { fetchZadaniaWithSolutions } from "@/lib/supabase/baza-zadan";
import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";
import { POST } from "@/app/api/trening/arkusz-solutions/route";

const mockAuth = vi.mocked(verifyTaskAssistRequest);
const mockFetch = vi.mocked(fetchZadaniaWithSolutions);

function request(body: unknown): Request {
  return new Request("http://localhost/api/trening/arkusz-solutions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/trening/arkusz-solutions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("odmawia dostępu bez Pro", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: false });
    const response = await POST(request({ arkuszId: "arkusz-mp-2026-maj" }));
    expect(response.status).toBe(403);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("zwraca klucz dla Pro", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: true });
    mockFetch.mockResolvedValue({
      data: [{ id: "z1", rozwiazanie: "Krok 1" }],
      error: null,
    } as never);

    const response = await POST(request({ arkuszId: "arkusz-mp-2026-maj" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      solutions: { z1: "Krok 1" },
    });
  });
});
