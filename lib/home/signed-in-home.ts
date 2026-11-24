export type SignedInHomeInput = {
  nick: string;
  level: number;
  streak: number;
  dueReviews: number;
  daysUntilExam: number | null;
  continueHref: string | null;
  continueTitle: string | null;
  hasDiagnostic: boolean;
};

export type HomeAction = {
  href: string;
  label: string;
};

function polishCount(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    count === 1
      ? one
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? few
        : many;
  return `${count} ${word}`;
}

export function signedInHeadline(input: SignedInHomeInput): {
  greeting: string;
  accent: string;
} {
  const nick = input.nick.trim() || "uczniu";
  let accent = "Wracasz do nauki.";
  if (input.dueReviews > 0) accent = "Masz powtórki na dziś.";
  else if (input.continueTitle) accent = "Wracasz do ostatniego tematu.";
  else if (!input.hasDiagnostic) accent = "Zacznij od diagnozy.";

  return { greeting: `Cześć, ${nick}.`, accent };
}

/** Jedna rzecz do zrobienia teraz, w tej kolejności: powtórki, temat, diagnoza, trening. */
export function signedInPrimaryAction(input: SignedInHomeInput): HomeAction {
  if (input.dueReviews > 0) {
    return { href: "/powtorki", label: "Zrób powtórki" };
  }
  if (input.continueHref && input.continueTitle) {
    return { href: input.continueHref, label: "Kontynuuj naukę" };
  }
  if (!input.hasDiagnostic) {
    return { href: "/diagnostyka", label: "Zrób diagnozę" };
  }
  return { href: "/trening", label: "Zacznij trening" };
}

export function signedInSummary(input: SignedInHomeInput): string {
  const parts: string[] = [];
  if (input.dueReviews > 0) {
    parts.push(
      `${polishCount(input.dueReviews, "powtórka", "powtórki", "powtórek")} czeka`,
    );
  }
  if (input.streak > 0) {
    parts.push(`seria ${polishCount(input.streak, "dzień", "dni", "dni")}`);
  }
  if (input.daysUntilExam !== null && input.daysUntilExam >= 0) {
    parts.push(
      input.daysUntilExam === 0
        ? "egzamin jest dziś"
        : `do egzaminu ${polishCount(input.daysUntilExam, "dzień", "dni", "dni")}`,
    );
  }
  if (input.continueTitle && input.dueReviews > 0) {
    parts.push(`ostatni temat: ${input.continueTitle}`);
  }
  if (parts.length === 0) {
    return "Wybierz temat albo zrób diagnozę, jeśli jeszcze jej nie masz.";
  }
  return `${parts.join(" · ")}.`;
}

export function signedInPlanCta(
  planId: string,
  isPro: boolean,
): HomeAction {
  if (planId === "start" || isPro) {
    return { href: "/trening", label: isPro && planId !== "start" ? "Masz Pro" : "Przejdź do treningu" };
  }
  if (planId === "pro") return { href: "/cennik", label: "Wybierz Pro" };
  return { href: "/cennik", label: "Wybierz roczny" };
}
