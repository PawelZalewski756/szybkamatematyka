import { afterEach, describe, expect, it, vi } from "vitest";
import { passwordResetRedirectUrl } from "@/lib/auth-password-reset";

describe("passwordResetRedirectUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("używa SITE_URL poza localhostem", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://szybkamatematyka.pl");
    vi.stubGlobal("window", {
      location: {
        hostname: "szybkamatematyka.pl",
        origin: "https://szybkamatematyka.pl",
      },
    });

    expect(passwordResetRedirectUrl()).toBe(
      "https://szybkamatematyka.pl/login/nowe-haslo",
    );
  });

  it("używa origin na localhost", () => {
    vi.stubGlobal("window", {
      location: { hostname: "localhost", origin: "http://localhost:3000" },
    });

    expect(passwordResetRedirectUrl()).toBe("http://localhost:3000/login/nowe-haslo");
  });
});
