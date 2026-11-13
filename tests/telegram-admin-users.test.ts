import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countUsersCreatedSince,
  listAllAuthUsers,
  paginateUsers,
  sortUsersByCreatedAtDesc,
  type AdminAuthUser,
} from "@/lib/telegram/admin-users";

function user(id: string, createdAt: string): AdminAuthUser {
  return {
    id,
    email: `${id}@example.com`,
    created_at: createdAt,
    last_sign_in_at: undefined,
    email_confirmed_at: undefined,
    user_metadata: {},
  };
}

const users = [
  user("a", "2026-01-01T10:00:00.000Z"),
  user("b", "2026-02-01T10:00:00.000Z"),
  user("c", "2026-03-01T10:00:00.000Z"),
];

describe("Telegram admin user helpers", () => {
  it("sorts newest accounts first", () => {
    expect(sortUsersByCreatedAtDesc(users).map((item) => item.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("counts accounts created after a cutoff", () => {
    const since = Date.parse("2026-02-15T00:00:00.000Z");
    expect(countUsersCreatedSince(users, since)).toBe(1);
  });

  it("clamps pagination to the available pages", () => {
    const page = paginateUsers(users, 99, 2);
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.users.map((item) => item.id)).toEqual(["c"]);
  });

  it("loads users across all Auth pages", async () => {
    const pages = [
      { users: [users[0], users[1]], total: 3, nextPage: 2 },
      { users: [users[2]], total: 3, nextPage: null },
    ];
    const fake = {
      auth: {
        admin: {
          listUsers: async ({ page }: { page?: number }) => ({
            data: pages[(page ?? 1) - 1],
            error: null,
          }),
        },
      },
    } as unknown as SupabaseClient;

    const result = await listAllAuthUsers(fake);
    expect(result.users).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.truncated).toBe(false);
  });
});
