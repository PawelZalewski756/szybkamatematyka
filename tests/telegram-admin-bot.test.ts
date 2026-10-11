import { describe, expect, it } from "vitest";
import {
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
});
