import { afterEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("getSupabaseAccessToken", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("odświeża sesję, która wygaśnie w ciągu minuty", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const refreshSession = vi.fn().mockResolvedValue({
      data: { session: { access_token: "fresh-token" } },
      error: null,
    });
    const getSession = vi.fn().mockResolvedValue({
      data: {
        session: {
          access_token: "old-token",
          expires_at: Math.floor(Date.now() / 1000) + 30,
        },
      },
      error: null,
    });
    createClientMock.mockReturnValue({
      auth: { getSession, refreshSession },
    });

    const { getSupabaseAccessToken } = await import("@/lib/supabase");

    await expect(getSupabaseAccessToken()).resolves.toBe("fresh-token");
    expect(refreshSession).toHaveBeenCalledOnce();
  });

  it("zwraca bieżący token, jeśli nie wygasa wkrótce", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const refreshSession = vi.fn();
    createClientMock.mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: "current-token",
              expires_at: Math.floor(Date.now() / 1000) + 3_600,
            },
          },
          error: null,
        }),
        refreshSession,
      },
    });

    const { getSupabaseAccessToken } = await import("@/lib/supabase");

    await expect(getSupabaseAccessToken()).resolves.toBe("current-token");
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
