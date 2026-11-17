import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { maybeSingle, eq, select, from };
});

const serviceMock = vi.hoisted(() => ({
  getServiceSupabaseOrNull: vi.fn(),
}));

vi.mock("@/lib/stripe/service-supabase", () => serviceMock);
vi.mock("@/lib/subscription/server-auth", () => ({
  verifyTaskAssistRequest: vi.fn(),
}));

import { verifyTaskAssistRequest } from "@/lib/subscription/server-auth";
import { POST } from "@/app/api/trening/cms-solution/route";

const mockAuth = vi.mocked(verifyTaskAssistRequest);

function request(body: unknown): Request {
  return new Request("http://localhost/api/trening/cms-solution", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/trening/cms-solution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: true });
    serviceMock.getServiceSupabaseOrNull.mockReturnValue({
      from: supabaseMock.from,
    });
  });

  it("odmawia dostępu bez Pro", async () => {
    mockAuth.mockResolvedValue({ ok: true, user: {} as never, isPro: false });
    const response = await POST(request({ zadanieId: "z1" }));
    expect(response.status).toBe(403);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("zwraca 503, gdy brak klucza service_role", async () => {
    serviceMock.getServiceSupabaseOrNull.mockReturnValue(null);
    const response = await POST(request({ zadanieId: "z1" }));
    expect(response.status).toBe(503);
  });

  it("czyta rozwiązanie kluczem service_role, nie anon", async () => {
    supabaseMock.maybeSingle.mockResolvedValue({
      data: { rozwiazanie: "Krok 1" },
      error: null,
    });
    await POST(request({ zadanieId: "z1" }));
    expect(serviceMock.getServiceSupabaseOrNull).toHaveBeenCalled();
  });

  it("zwraca 404 dla nieznanego zadania", async () => {
    supabaseMock.maybeSingle.mockResolvedValue({ data: null, error: null });
    const response = await POST(request({ zadanieId: "z1" }));
    expect(response.status).toBe(404);
  });

  it("zwraca rozwiązanie dla Pro", async () => {
    supabaseMock.maybeSingle.mockResolvedValue({
      data: { rozwiazanie: "Krok 1" },
      error: null,
    });
    const response = await POST(request({ zadanieId: "z1" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ solution: "Krok 1" });
  });
});
