import { afterEach, describe, expect, it } from "vitest";
import { verifyAdminRequest } from "@/lib/supabase/admin";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }
});

describe("verifyAdminRequest", () => {
  it("odmawia dostępu, gdy serwerowa whitelista nie jest skonfigurowana", async () => {
    delete process.env.ADMIN_EMAILS;
    const request = new Request("https://example.test/api/admin", {
      headers: { Authorization: "Bearer fake-token" },
    });

    await expect(verifyAdminRequest(request)).resolves.toEqual({
      ok: false,
      status: 403,
      error: "Panel administratora nie jest skonfigurowany.",
    });
  });

  it("bez tokenu nadal zwraca 401", async () => {
    process.env.ADMIN_EMAILS = "admin@example.test";
    await expect(
      verifyAdminRequest(new Request("https://example.test/api/admin")),
    ).resolves.toMatchObject({ ok: false, status: 401 });
  });
});

