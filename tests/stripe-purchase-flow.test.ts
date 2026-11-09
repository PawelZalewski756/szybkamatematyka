import { beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

const USER = "user-1";
const profiles: Record<string, Record<string, unknown>> = {};

vi.mock("@/lib/stripe/service-supabase", () => ({
  isServiceRoleConfigured: () => true,
  getServiceSupabaseOrNull: () => ({
    from: () => ({
      update: (patch: Record<string, unknown>) => ({
        eq: async (_col: string, id: string) => {
          profiles[id] = { ...profiles[id], ...patch };
          return { error: null };
        },
      }),
    }),
  }),
}));

vi.mock("@/lib/subscription/server-auth", () => ({
  verifyUserRequest: async (req: Request) =>
    req.headers.get("authorization") === "Bearer ok"
      ? { ok: true, user: { id: USER, email: "a@b.pl" } }
      : { ok: false, status: 401, error: "Wymagane zalogowanie." },
}));

const sub = {
  id: "sub_1",
  status: "active",
  customer: "cus_1",
  cancel_at_period_end: false,
  metadata: { supabase_user_id: USER, plan_id: "pro" },
  items: { data: [{ current_period_end: 1893456000, price: { id: "price_pro" } }] },
};
let session: Record<string, unknown>;
const stripeMock = {
  checkout: {
    sessions: {
      retrieve: async () => session,
      create: vi.fn(async () => ({ url: "https://checkout.stripe.test/x" })),
    },
  },
  subscriptions: { retrieve: async () => sub },
  webhooks: new Stripe("sk_test_x").webhooks,
};
vi.mock("@/lib/stripe/config", () => ({
  isStripeConfigured: () => true,
  isStripeWebhookConfigured: () => true,
  getStripeWebhookSecret: () => "whsec_test",
  getStripeOrNull: () => stripeMock,
  resolveSiteUrl: () => "https://site.test",
}));

const req = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers });

beforeEach(() => {
  for (const k of Object.keys(profiles)) delete profiles[k];
  process.env.STRIPE_PRICE_PRO = "price_pro";
  session = {
    mode: "subscription",
    status: "complete",
    client_reference_id: USER,
    subscription: "sub_1",
  };
});

describe("symulacja zakupu Pro", () => {
  it("checkout: poprawny Price ID tworzy sesje z session_id w success_url", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(req("http://x/api/checkout", { planId: "pro" }, { authorization: "Bearer ok" }));
    expect(res.status).toBe(200);
    const args = stripeMock.checkout.sessions.create.mock.calls[0][0] as { success_url: string };
    expect(args.success_url).toContain("session_id={CHECKOUT_SESSION_ID}");
  });

  it("checkout: nazwa zmiennej zamiast Price ID daje czytelny blad", async () => {
    process.env.STRIPE_PRICE_PRO = "STRIPE_PRICE_PRO";
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(req("http://x/api/checkout", { planId: "pro" }, { authorization: "Bearer ok" }));
    expect(res.status).toBe(503);
  });

  it("confirm (bez webhooka): po platnosci profil dostaje active/pro", async () => {
    const { POST } = await import("@/app/api/checkout/confirm/route");
    const res = await POST(req("http://x", { sessionId: "cs_live_1" }, { authorization: "Bearer ok" }));
    expect((await res.json()).confirmed).toBe(true);
    expect(profiles[USER]).toMatchObject({ subscription_status: "active", subscription_plan: "pro" });
  });

  it("confirm: cudza sesja jest odrzucona, niezaplacona nie daje Pro", async () => {
    const { POST } = await import("@/app/api/checkout/confirm/route");
    session.client_reference_id = "other";
    expect((await POST(req("http://x", { sessionId: "cs_1" }, { authorization: "Bearer ok" }))).status).toBe(403);
    session.client_reference_id = USER;
    session.status = "open";
    expect((await (await POST(req("http://x", { sessionId: "cs_1" }, { authorization: "Bearer ok" }))).json()).confirmed).toBe(false);
    expect(profiles[USER]).toBeUndefined();
  });

  it("confirm: bez logowania 401", async () => {
    const { POST } = await import("@/app/api/checkout/confirm/route");
    expect((await POST(req("http://x", { sessionId: "cs_1" }))).status).toBe(401);
  });

  it("webhook: poprawnie podpisane zdarzenie nadaje Pro, zly podpis 400", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = JSON.stringify({
      id: "evt_1",
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", subscription: "sub_1", client_reference_id: USER } },
    });
    const header = stripeMock.webhooks.generateTestHeaderString({ payload, secret: "whsec_test" });
    expect((await POST(req("http://x", payload, { "stripe-signature": header }))).status).toBe(200);
    expect(profiles[USER]).toMatchObject({ subscription_status: "active" });
    expect((await POST(req("http://x", payload, { "stripe-signature": "t=1,v1=bad" }))).status).toBe(400);
  });
});
