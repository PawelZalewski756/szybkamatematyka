import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() =>
  vi.fn(async (...args: unknown[]) => {
    void args;
    return { ok: true };
  }),
);

vi.mock("@/lib/telegram/send", () => ({
  sendTelegramMessage: sendMock,
}));

import { reportServerError } from "@/lib/observability/report";
import { resetRateLimit } from "@/lib/security/rate-limit";

describe("reportServerError", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetRateLimit();
  });

  it("loguje błąd i nie wysyła nic, gdy Telegram nie jest skonfigurowany", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_ADMIN_IDS", "");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await reportServerError("api/test", new Error("boom"));

    expect(consoleError).toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("wysyła alert na wszystkie ID administratorów", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "token");
    vi.stubEnv("TELEGRAM_ADMIN_IDS", "111, 222");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await reportServerError("api/test", new Error("boom"));

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[0][1]).toBe("111");
    expect(sendMock.mock.calls[1][1]).toBe("222");
    expect(String(sendMock.mock.calls[0][2])).toContain("api/test");
    expect(String(sendMock.mock.calls[0][2])).toContain("boom");
  });

  it("dławi powtórzone alerty z tego samego kontekstu", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "token");
    vi.stubEnv("TELEGRAM_ADMIN_IDS", "111");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await reportServerError("api/test", new Error("pierwszy"));
    await reportServerError("api/test", new Error("drugi"));

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("nie rzuca, gdy wysyłka Telegrama zawiedzie", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "token");
    vi.stubEnv("TELEGRAM_ADMIN_IDS", "111");
    vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValueOnce(new Error("telegram down"));

    await expect(
      reportServerError("api/test", new Error("boom")),
    ).resolves.toBeUndefined();
  });
});
