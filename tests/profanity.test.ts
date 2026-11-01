import { describe, expect, it } from "vitest";
import { containsProfanity } from "@/lib/profanity";
import { validateNick } from "@/lib/auth-errors";

describe("containsProfanity", () => {
  it.each([
    "kurwa",
    "KURWĄ",
    "pierdół",
    "k_u_r_w_a",
    "p!erd0l",
    "fuck",
    "f.u.c.k",
    "sh1t",
    "bitch123",
    "cwel",
    "cwela",
    "c_w_e_l_123",
    "skurwysyn",
    "debil",
    "pedał",
    "dumbass",
  ])(
    "rejects Polish and English profanity, including obfuscations: %s",
    (nick) => {
      expect(containsProfanity(nick)).toBe(true);
    },
  );

  it.each(["Kasia", "Matematyka", "Uczen_2026"])(
    "allows an ordinary nickname: %s",
    (nick) => {
      expect(containsProfanity(nick)).toBe(false);
    },
  );
});

describe("validateNick", () => {
  it("explains that profanity is not allowed", () => {
    expect(validateNick("k_u_r_w_a")).toBe(
      "Nick nie może zawierać wulgarnych słów.",
    );
  });
});
