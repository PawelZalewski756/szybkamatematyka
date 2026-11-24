import { describe, expect, it } from "vitest";

import {
  proMemberPricing,
  signedInHeadline,
  signedInPlanCta,
  signedInPrimaryAction,
  signedInSummary,
  type SignedInHomeInput,
} from "@/lib/home/signed-in-home";

function input(overrides: Partial<SignedInHomeInput> = {}): SignedInHomeInput {
  return {
    nick: "Dadadada",
    level: 3,
    streak: 4,
    dueReviews: 0,
    daysUntilExam: null,
    continueHref: null,
    continueTitle: null,
    hasDiagnostic: true,
    ...overrides,
  };
}

describe("strona główna zalogowanego", () => {
  it("nie proponuje rejestracji, gdy są zaległe powtórki", () => {
    const home = input({ dueReviews: 12, continueTitle: "Funkcja kwadratowa" });
    expect(signedInPrimaryAction(home)).toEqual({
      href: "/powtorki",
      label: "Zrób powtórki",
    });
    expect(signedInHeadline(home).greeting).toBe("Cześć, Dadadada.");
    expect(signedInHeadline(home).accent).toBe("Masz powtórki na dziś.");
    expect(signedInSummary(home)).toContain("12 powtórek");
    expect(signedInSummary(home)).toContain("Funkcja kwadratowa");
  });

  it("prowadzi do ostatniego tematu, gdy nie ma zaległych powtórek", () => {
    const home = input({
      continueHref: "/trening/matura/funkcje/kwadratowa",
      continueTitle: "Funkcja kwadratowa",
    });
    expect(signedInPrimaryAction(home).href).toBe(
      "/trening/matura/funkcje/kwadratowa",
    );
    expect(signedInHeadline(home).accent).toBe("Wracasz do ostatniego tematu.");
  });

  it("zaczyna od diagnozy, gdy konto jest puste", () => {
    const home = input({ hasDiagnostic: false, streak: 0 });
    expect(signedInPrimaryAction(home)).toEqual({
      href: "/diagnostyka",
      label: "Zrób diagnozę",
    });
    expect(signedInSummary(home)).toContain("diagnozę");
  });

  it("odmienia dni i powtórki", () => {
    expect(signedInSummary(input({ dueReviews: 1, streak: 1 }))).toContain(
      "1 powtórka",
    );
    expect(signedInSummary(input({ dueReviews: 1, streak: 1 }))).toContain(
      "seria 1 dzień",
    );
    expect(
      signedInSummary(input({ dueReviews: 0, streak: 0, daysUntilExam: 2 })),
    ).toContain("2 dni");
  });

  it("cennik po zalogowaniu nie każe zakładać konta", () => {
    expect(signedInPlanCta("start", false).label).toBe("Przejdź do treningu");
    expect(signedInPlanCta("pro", true).label).toBe("Masz Pro");
    expect(signedInPlanCta("pro", false).href).toBe("/cennik");
  });

  it("aktywne Pro nie prowadzi do zakupu", () => {
    const pricing = proMemberPricing();
    expect(pricing.title).toBe("Masz już Pro.");
    expect(pricing.text).not.toMatch(/29 zł|249 zł/);
    expect(pricing.train.href).toBe("/trening");
    expect(pricing.manage.href).toBe("/profil");
  });
});