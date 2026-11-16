import { afterEach, describe, expect, it, vi } from "vitest";
import {
  sendWelcomeEmail,
  welcomeEmailHtml,
} from "@/lib/email/welcome";

describe("welcomeEmailHtml", () => {
  it("escapuje nick i zawiera linki startowe", () => {
    const html = welcomeEmailHtml({
      to: "kasia@example.com",
      nick: "<Kasia & Admin>",
      siteUrl: "https://szybkamatematyka.pl/",
    });

    expect(html).toContain("&lt;Kasia &amp; Admin&gt;");
    expect(html).toContain("https://szybkamatematyka.pl/diagnostyka");
    expect(html).toContain("https://szybkamatematyka.pl/plan-klasy");
    expect(html).not.toContain("<Kasia");
  });
});

describe("sendWelcomeEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("nie wysyła nic bez klucza Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const result = await sendWelcomeEmail({
      to: "kasia@example.com",
      nick: "Kasia",
      siteUrl: "https://szybkamatematyka.pl",
    });
    expect(result).toEqual({ ok: false, error: "not configured" });
  });

  it("wysyła maila przez Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "email_1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWelcomeEmail({
      to: "kasia@example.com",
      nick: "Kasia",
      siteUrl: "https://szybkamatematyka.pl",
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
