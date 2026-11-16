import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deliverSignupNotification,
  type DeliverSignupNotificationOptions,
} from "@/lib/telegram/signup-delivery";
import { describeTelegramFailure, normalizeTelegramBotToken } from "@/lib/telegram/send";

const ORIGINAL_ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_IDS: process.env.TELEGRAM_ADMIN_IDS,
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function user(overrides: Partial<DeliverSignupNotificationOptions> = {}) {
  return {
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      email: "kasia@example.com",
      created_at: new Date().toISOString(),
      email_confirmed_at: null,
      user_metadata: { nick: "Kasia", school_level: "sp" },
    },
    ...overrides,
  };
}

describe("deliverSignupNotification", () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.TELEGRAM_ADMIN_IDS = "111,222";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.ADMIN_TELEGRAM_ID;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEnv();
  });

  it("wysyła powiadomienie bez service role, korzystając z danych z rejestracji", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({
          url: String(input),
          body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
        });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const result = await deliverSignupNotification(
      "11111111-1111-4111-8111-111111111111",
      user(),
    );

    expect(result.status).toBe(200);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.url).toContain("/bot123:ABC/sendMessage");
    expect(calls[0]?.body.chat_id).toBe("111");
    expect(calls[0]?.body.text).toContain("Kasia");
    expect(calls[0]?.body.text).toContain("kasia@example.com");
  });

  it("zwraca czytelny błąd, gdy Telegram odmówi (np. brak /start)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            ok: false,
            description: "Forbidden: bot can't initiate conversation with a user",
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await deliverSignupNotification(
      "11111111-1111-4111-8111-111111111111",
      user(),
    );

    expect(result.status).toBe(502);
    const failures = result.body.failures as Array<{ error: string }>;
    expect(failures).toHaveLength(2);
    expect(failures[0]?.error).toContain("/start");
  });

  it("nie wysyła powiadomienia dla starego konta", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverSignupNotification(
      "11111111-1111-4111-8111-111111111111",
      user({
        user: {
          id: "11111111-1111-4111-8111-111111111111",
          email: "kasia@example.com",
          created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          email_confirmed_at: null,
          user_metadata: { nick: "Kasia" },
        },
      }),
    );

    expect(result.status).toBe(202);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("zgłasza brak tokenu zamiast udawać sukces", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    const result = await deliverSignupNotification(
      "11111111-1111-4111-8111-111111111111",
      user(),
    );

    expect(result.status).toBe(503);
    expect(result.body.missing).toContain("TELEGRAM_BOT_TOKEN");
  });
});

describe("normalizeTelegramBotToken", () => {
  it("usuwa przypadkowy prefiks bot z tokenu", () => {
    expect(normalizeTelegramBotToken("bot123:ABC")).toBe("123:ABC");
    expect(normalizeTelegramBotToken("  123:ABC  ")).toBe("123:ABC");
    expect(normalizeTelegramBotToken(undefined)).toBe("");
  });
});

describe("describeTelegramFailure", () => {
  it("tłumaczy 403 na konkretną instrukcję", () => {
    expect(describeTelegramFailure(403, "Forbidden")).toContain("/start");
  });

  it("tłumaczy 400 chat not found na wskazówkę o ADMIN_IDS", () => {
    expect(describeTelegramFailure(400, "Bad Request: chat not found")).toContain(
      "TELEGRAM_ADMIN_IDS",
    );
  });
});
