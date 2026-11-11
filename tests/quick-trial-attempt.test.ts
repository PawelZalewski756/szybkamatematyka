import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

import { POST } from "@/app/api/quick-trial/attempt/route";

const SESSION_ID = "3b12f1df-5232-4804-897e-917bf397618a";
const CLIENT_IP = "203.0.113.8";
const SERVICE_KEY = "service-role-test-key";

function request(headers: Record<string, string> = {}) {
  return new Request("https://szybkamatematyka.pl/api/quick-trial/attempt", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vercel-forwarded-for": CLIENT_IP,
      ...headers,
    },
    body: JSON.stringify({ sessionId: SESSION_ID, isCorrect: false }),
  });
}

describe("POST /api/quick-trial/attempt", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("sends a keyed IP hash to Supabase and records the attempt", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    createClientMock.mockReturnValue({ rpc });

    const response = await POST(request());
    const expectedHash = createHmac("sha256", SERVICE_KEY)
      .update(CLIENT_IP)
      .digest("hex");

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("record_quick_trial_attempt", {
      p_session_id: SESSION_ID,
      p_is_correct: false,
      p_ip_hash: expectedHash,
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(CLIENT_IP);
  });

  it("falls back to the legacy RPC when the rate-limited function is missing", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST202", message: "missing" } })
      .mockResolvedValueOnce({ data: null, error: null });
    createClientMock.mockReturnValue({ rpc });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("record_quick_trial_attempt", {
      p_session_id: SESSION_ID,
      p_is_correct: false,
    });
  });

  it("returns 429 when the database rate limiter rejects an attempt", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
    createClientMock.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });

  it("fails closed in production if the trusted proxy IP header is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);

    const response = await POST(request({ "x-vercel-forwarded-for": "" }));

    expect(response.status).toBe(503);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
