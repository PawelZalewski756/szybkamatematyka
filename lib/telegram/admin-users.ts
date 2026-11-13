import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AdminAuthUser = Pick<
  User,
  | "id"
  | "email"
  | "created_at"
  | "last_sign_in_at"
  | "email_confirmed_at"
  | "user_metadata"
>;

export type AuthUserPage = {
  users: AdminAuthUser[];
  total: number;
  totalPages: number;
  page: number;
};

/**
 * Pobiera konta z Auth w kolejności najnowszych. Admin API nie gwarantuje
 * sortowania, a lista jest paginowana od najstarszych stron, więc zbieramy
 * wszystkie strony i sortujemy dopiero lokalnie. Dzięki temu nowe konto
 * pojawia się na początku /new i /users.
 */
export async function listAllAuthUsers(
  supabase: SupabaseClient,
  maxPages = 20,
): Promise<{ users: AdminAuthUser[]; total: number; truncated: boolean }> {
  const users: AdminAuthUser[] = [];
  let page = 1;
  let total = 0;
  let truncated = false;

  for (let fetchedPages = 0; fetchedPages < maxPages; fetchedPages += 1) {
    const result = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (result.error) {
      throw new Error(`Could not load users: ${result.error.message}`);
    }

    const data = result.data as {
      users?: AdminAuthUser[];
      nextPage?: number | null;
      total?: number;
    };
    const batch = data.users ?? [];
    users.push(...batch);
    if (typeof data.total === "number") total = data.total;

    if (!data.nextPage || batch.length === 0) {
      return {
        users,
        total: Math.max(total, users.length),
        truncated: false,
      };
    }

    page = data.nextPage;
  }

  truncated = true;
  return { users, total: Math.max(total, users.length), truncated };
}

export function sortUsersByCreatedAtDesc(
  users: AdminAuthUser[],
): AdminAuthUser[] {
  return [...users].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function countUsersCreatedSince(
  users: AdminAuthUser[],
  sinceMs: number,
): number {
  return users.filter((user) => {
    const createdAt = Date.parse(user.created_at);
    return Number.isFinite(createdAt) && createdAt >= sinceMs;
  }).length;
}

export function paginateUsers(
  users: AdminAuthUser[],
  requestedPage: number,
  perPage: number,
): AuthUserPage {
  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * perPage;
  return {
    users: users.slice(start, start + perPage),
    total,
    totalPages,
    page,
  };
}
