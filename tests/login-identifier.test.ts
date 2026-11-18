import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimit } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  profile: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseOrNull: () => ({
    auth: { signInWithPassword: mocks.signIn },
  }),
}));

vi.mock("@/lib/stripe/service-supabase", () => ({
  getServiceSupabaseOrNull: () => ({
    from: () => ({
      select: () => ({
        or: () => ({
          limit: () => ({
            maybeSingle: mocks.profile,
          }),
        }),
      }),
    }),
    auth: { admin: { getUserById: mocks.getUserById } },
  }),
}));

import { POST } from "@/app/api/auth/login/route";

const request = (body: Record<string, unknown>) =>
  new Request("https://site.test/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  resetRateLimit();
  mocks.signIn.mockReset();
  mocks.profile.mockReset();
  mocks.getUserById.mockReset();
  mocks.profile.mockResolvedValue({ data: { id: "user-1", nick: "vlad" }, error: null });
  mocks.getUserById.mockResolvedValue({
    data: { user: { email: "vlad@example.com" } },
    error: null,
  });
  mocks.signIn.mockResolvedValue({
    data: {
      session: {
        access_token: "access",
        refresh_token: "refresh",
        expires_in: 3600,
        token_type: "bearer",
      },
      user: { id: "user-1" },
    },
    error: null,
  });
});

describe("logowanie nickiem/e-mailem", () => {
  it("nick tłumaczy na e-mail i zwraca sesję", async () => {
    const response = await POST(request({ identifier: "vlad", password: "tajne123" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      access_token: "access",
      refresh_token: "refresh",
    });
    expect(mocks.getUserById).toHaveBeenCalledWith("user-1");
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "vlad@example.com",
      password: "tajne123",
    });
  });

  it("e-mail loguje bez szukania profilu", async () => {
    const response = await POST(
      request({ identifier: "vlad@example.com", password: "tajne123" }),
    );
    expect(response.status).toBe(200);
    expect(mocks.profile).not.toHaveBeenCalled();
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "vlad@example.com",
      password: "tajne123",
    });
  });

  it("nieznany nick daje generyczny 401", async () => {
    mocks.profile.mockResolvedValue({ data: null, error: null });
    const response = await POST(request({ identifier: "nie-ma", password: "tajne123" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Nieprawidłowy nick/e-mail lub hasło.",
    });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("złe hasło daje 401, bez ujawniania czy nick istnieje", async () => {
    mocks.signIn.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Invalid login credentials" },
    });
    const response = await POST(request({ identifier: "vlad", password: "zle-haslo" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Nieprawidłowy nick/e-mail lub hasło.",
    });
  });
});
