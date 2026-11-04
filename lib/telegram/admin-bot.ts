export type TelegramCommand = {
  name: string;
  args: string[];
};

export function parseTelegramCommand(text: string): TelegramCommand | null {
  const [command = "", ...args] = text.trim().split(/\s+/);
  if (!command.startsWith("/")) return null;

  const parsedName = command.slice(1).split("@")[0]?.toLowerCase() ?? "";
  const name = parsedName === "pomoc" ? "help" : parsedName;
  return name ? { name, args } : null;
}

export function parseTelegramAdminIds(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^\d+$/.test(id)),
  );
}

export function isTelegramAdmin(
  userId: number,
  primaryIds: string | undefined,
  legacyId: string | undefined,
): boolean {
  const configuredIds = parseTelegramAdminIds(primaryIds);
  if (configuredIds.size === 0) {
    for (const id of parseTelegramAdminIds(legacyId)) configuredIds.add(id);
  }
  return configuredIds.has(String(userId));
}

export function escapeTelegramText(value: string): string {
  return value.replace(/[&<>]/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    return "&gt;";
  });
}

export function describeTelegramCommandError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "Nieznany błąd.";

  if (message.includes("Missing Supabase server configuration")) {
    return "Brak SUPABASE_SERVICE_ROLE_KEY lub NEXT_PUBLIC_SUPABASE_URL w zmiennych Production Vercel.";
  }

  if (
    message.includes("quick_trial") &&
    (message.includes("does not exist") ||
      message.includes("schema cache") ||
      message.includes("Could not find the function"))
  ) {
    return "Brakuje migracji szybkiej próby. Uruchom supabase/migrations/20261104214800_quick_trial_analytics.sql.";
  }

  if (
    message.includes("solved_tasks") &&
    (message.includes("does not exist") ||
      message.includes("schema cache") ||
      message.includes("Could not find the table"))
  ) {
    return "Brakuje tabeli solved_tasks. Uruchom supabase/migrations/init_solved_tasks.sql w Supabase → SQL Editor.";
  }

  return `Błąd pobierania danych: ${message.slice(0, 300)}`;
}
