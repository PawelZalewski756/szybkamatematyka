import { describe, expect, it } from "vitest";
import {
  hashVisitorId,
  getAnalyticsSource,
  isValidPagePath,
  isValidVisitorId,
} from "@/lib/analytics/page-view";
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
    expect(
      describeTelegramCommandError({
        message: "Could not find the function public.get_page_view_stats in the schema cache",
      }),
    ).toContain("20261011100000_add_anonymous_page_analytics.sql");
    expect(
      describeTelegramCommandError({
        message: "Could not find the function public.get_source_funnel_stats in the schema cache",
      }),
    ).toContain("20261011170000_add_funnel_analytics.sql");
  });
});

describe("anonymous page-view analytics helpers", () => {
  it("accepts a UUID and hashes it without retaining the original identifier", () => {
    const visitorId = "123e4567-e89b-42d3-a456-426614174000";
    expect(isValidVisitorId(visitorId)).toBe(true);
    expect(hashVisitorId(visitorId)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashVisitorId(visitorId)).toBe(hashVisitorId(visitorId.toUpperCase()));
  });

  it("accepts only local pathnames without query strings or fragments", () => {
    expect(isValidPagePath("/trening/matura")).toBe(true);
    expect(isValidPagePath("//elsewhere.example")).toBe(false);
    expect(isValidPagePath("/profil?email=x@example.com")).toBe(false);
  });

  it("keeps only safe campaign source labels", () => {
    expect(getAnalyticsSource("?utm_source=instagram")).toBe("instagram");
    expect(getAnalyticsSource("?utm_source=student%40example.com")).toBeNull();
  });
});
