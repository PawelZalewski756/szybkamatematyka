import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("zwraca 200 i listę integracji bez wartości sekretów", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-secret-value");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_super_secret");
    vi.stubEnv("RESEND_API_KEY", "re_secret");
    vi.stubEnv("GEMINI_API_KEY", "");

    const response = GET();
    const data = (await response.json()) as {
      ok: boolean;
      service: string;
      integrations: Record<string, boolean>;
    };

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.service).toBe("szybka-matematyka");
    expect(typeof data.integrations.supabase).toBe("boolean");
    expect(typeof data.integrations.stripe).toBe("boolean");
    expect(typeof data.integrations.resend).toBe("boolean");
    expect(typeof data.integrations.gemini).toBe("boolean");
    expect(typeof data.integrations.telegram).toBe("boolean");

    const raw = JSON.stringify(data);
    expect(raw).not.toContain("anon-secret-value");
    expect(raw).not.toContain("sk_live_super_secret");
    expect(raw).not.toContain("re_secret");
  });

  it("nigdy nie cache'uje odpowiedzi", () => {
    const response = GET();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
