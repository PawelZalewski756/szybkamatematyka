import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { grantProToUser } from "@/lib/subscription/grant-pro";

function clientWithProfile(profile: Record<string, unknown>) {
  const update = vi.fn(() => ({
    eq: vi.fn(async () => ({ error: null })),
  }));
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: profile, error: null }),
        }),
      }),
      update,
    }),
  };
  return { client: client as unknown as SupabaseClient, update };
}

describe("grantProToUser", () => {
  it("nie nadpisuje aktywnego płatnego Pro Stripe", async () => {
    const { client, update } = clientWithProfile({
      id: "u1",
      subscription_status: "active",
      pro_source: "stripe",
      stripe_subscription_id: "sub_1",
      subscription_current_period_end: null,
    });
    const result = await grantProToUser(client, {
      userId: "u1",
      email: "a@b.pl",
      nick: "vlad",
      days: 30,
    });
    expect(result.status).toBe("skipped_paid");
    expect(update).not.toHaveBeenCalled();
  });

  it("wydłuża istniejący gift od daty końca", async () => {
    const end = new Date(Date.now() + 10 * 86400_000).toISOString();
    const { client, update } = clientWithProfile({
      id: "u2",
      subscription_status: "active",
      pro_source: "gift",
      stripe_subscription_id: null,
      subscription_current_period_end: end,
    });
    const result = await grantProToUser(client, {
      userId: "u2",
      email: "gift@example.com",
      nick: "gift",
      days: 30,
      reason: "test",
    });
    expect(result).toMatchObject({ status: "granted", days: 30, extended: true });
    if (result.status !== "granted") throw new Error("not granted");
    expect(Date.parse(result.periodEnd)).toBeGreaterThan(Date.parse(end));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_status: "active",
        subscription_plan: "pro",
        pro_source: "gift",
        pro_granted_reason: "test",
      }),
    );
  });

  it("przyznaje nowy gift na 30 dni", async () => {
    const { client } = clientWithProfile({
      id: "u3",
      subscription_status: "free",
      pro_source: "none",
      stripe_subscription_id: null,
      subscription_current_period_end: null,
    });
    const result = await grantProToUser(client, {
      userId: "u3",
      email: null,
      nick: "nowy",
      days: 30,
    });
    expect(result).toMatchObject({ status: "granted", extended: false });
    if (result.status !== "granted") throw new Error("not granted");
    const days = (Date.parse(result.periodEnd) - Date.now()) / 86400_000;
    expect(days).toBeGreaterThan(29);
    expect(days).toBeLessThanOrEqual(30);
  });
});
