import {
  learningPathLabel,
  type LearningPath,
} from "@/lib/learning-path";

export type SignupNotificationDetails = {
  nickname: string;
  email: string;
  schoolLevel: LearningPath | null;
  createdAt: string;
  emailConfirmed: boolean;
};

function telegramLine(value: string, maxLength: number): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function formatSignupNotification(
  details: SignupNotificationDetails,
): string {
  const createdAt = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(details.createdAt));

  return [
    "Nowa rejestracja",
    `Nick: ${telegramLine(details.nickname, 80) || "bez nicku"}`,
    `E-mail: ${telegramLine(details.email, 200) || "brak"}`,
    `Poziom nauki: ${
      details.schoolLevel ? learningPathLabel(details.schoolLevel) : "nie wybrano"
    }`,
    `Potwierdzenie e-maila: ${
      details.emailConfirmed ? "potwierdzony" : "oczekuje na potwierdzenie"
    }`,
    `Data: ${createdAt}`,
  ].join("\n");
}

export function isRecentSignup(
  createdAt: string,
  now: number,
  maxAgeMs: number,
): boolean {
  const createdAtMs = Date.parse(createdAt);
  return (
    Number.isFinite(createdAtMs) &&
    createdAtMs <= now + 60_000 &&
    now - createdAtMs <= maxAgeMs
  );
}
