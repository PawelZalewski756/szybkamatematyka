import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authRedirectUrl,
  passwordResetRedirectUrl,
  SIGNUP_SUCCESS_PATH,
  signupSuccessPath,
} from "@/lib/auth-password-reset";

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

  it("używa tego samego callbacku dla potwierdzenia rejestracji", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://szybkamatematyka.pl/");
    vi.stubGlobal("window", {
      location: {
        hostname: "szybkamatematyka.pl",
        origin: "https://szybkamatematyka.pl",
      },
    });

    expect(authRedirectUrl("/login")).toBe(
      "https://szybkamatematyka.pl/login",
    );
  });
});

describe("signupSuccessPath", () => {
  it("zwraca stały URL sukcesu rejestracji", () => {
    expect(SIGNUP_SUCCESS_PATH).toBe("/login/sukces");
    expect(signupSuccessPath()).toBe("/login/sukces");
  });

  it("dodaje flagę potwierdzenia e-mail", () => {
    expect(signupSuccessPath(true)).toBe("/login/sukces?confirm=1");
  });
});
