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
