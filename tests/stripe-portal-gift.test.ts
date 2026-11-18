import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stripe/config", () => ({
  isStripeConfigured: () => true,
  getStripeOrNull: () => ({
    billingPortal: {
      sessions: {
        create: async () => ({ url: "https://billing.stripe.test/x" }),
      },
    },
  }),
  resolveSiteUrl: () => "https://site.test",
}));

vi.mock("@/lib/subscription/server-auth", () => ({
  verifyUserRequest: async () => ({
    ok: true,
    user: { id: "user-gift", email: "gift@example.com" },
  }),
}));

vi.mock("@/lib/stripe/service-supabase", () => ({
  isServiceRoleConfigured: () => true,
  getServiceSupabaseOrNull: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { stripe_customer_id: null, pro_source: "gift" },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

import { POST } from "@/app/api/stripe/portal/route";

describe("Stripe Customer Portal", () => {
  it("blokuje portal dla Pro przyznanego ręcznie", async () => {
    const response = await POST(
      new Request("https://site.test/api/stripe/portal", { method: "POST" }),
    );
    expect(response.status).toBe(409);
    const body = (await response.json()) as { code?: string };
    expect(body.code).toBe("gift_no_stripe_subscription");
  });
});
