import { describe, expect, it } from "vitest";
import {
  describeTelegramCommandError,
  escapeTelegramText,
  isTelegramAdmin,
  parseTelegramAdminIds,
  parseTelegramCommand,
} from "@/lib/telegram/admin-bot";

describe("Telegram admin bot helpers", () => {
  it("parses commands addressed to the bot", () => {
    expect(parseTelegramCommand("/stats@my_bot extra")).toEqual({
      name: "stats",
      args: ["extra"],
    });
    expect(parseTelegramCommand("/pomoc")).toEqual({ name: "help", args: [] });
    expect(parseTelegramCommand("hello")).toBeNull();
  });

  it("accepts only numeric admin IDs and supports the legacy single ID", () => {
    expect(parseTelegramAdminIds("12, abc, 34")).toEqual(new Set(["12", "34"]));
    expect(isTelegramAdmin(42, "", "42")).toBe(true);
    expect(isTelegramAdmin(42, "43", "42")).toBe(false);
  });

  it("escapes profile names before including them in HTML-formatted replies", () => {
    expect(escapeTelegramText("<admin & user>")).toBe(
      "&lt;admin &amp; user&gt;",
    );
  });

  it("gives actionable diagnostics for missing Supabase configuration and stats table", () => {
    expect(
      describeTelegramCommandError(
        new Error("Missing Supabase server configuration for Telegram bot."),
      ),
    ).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(
      describeTelegramCommandError({
        message: "Could not find the table 'public.solved_tasks' in the schema cache",
      }),
    ).toContain("init_solved_tasks.sql");
  });
});
