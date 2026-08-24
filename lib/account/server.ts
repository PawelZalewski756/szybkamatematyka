import { createClient, type User } from "@supabase/supabase-js";
import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { logWarn } from "@/lib/observability/logger";

const AVATAR_BUCKET = "avatary";

const USER_TABLES = [
  "profiles",
  "solved_tasks",
  "review_schedule",
  "duel_results",
  "user_achievements",
  "daily_challenges",
  "profile_reward_events",
  "topic_mastery",
] as const;

function userScopedClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function selectOwn(
  table: string,
  userId: string,
  token: string,
): Promise<unknown[] | { error: string }> {
  const sb = getServiceSupabaseOrNull() ?? userScopedClient(token);
  if (!sb) return { error: "Brak konfiguracji bazy." };

  const column = table === "profiles" ? "id" : "user_id";
  const { data, error } = await sb.from(table).select("*").eq(column, userId);
  if (error) {
    logWarn("account.export_table_failed", {
      table,
      message: error.message.slice(0, 200),
    });
    return [];
  }
  return data ?? [];
}

export async function exportAccountData(
  user: User,
  accessToken: string,
): Promise<Record<string, unknown>> {
  const tables: Record<string, unknown> = {};
  for (const table of USER_TABLES) {
    tables[table] = await selectOwn(table, user.id, accessToken);
  }

  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
    },
    tables,
  };
}

export async function deleteAccountData(
  user: User,
  accessToken: string,
): Promise<{ authDeleted: boolean }> {
  const userClient = userScopedClient(accessToken);
  if (userClient) {
    const { error } = await userClient.rpc("purge_own_user_data");
    if (error) {
      logWarn("account.purge_rpc_failed", {
        message: error.message.slice(0, 200),
      });
    }
  }

  const service = getServiceSupabaseOrNull();
  if (service) {
    await service.storage.from(AVATAR_BUCKET).remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.png`,
    ]);
    const { error } = await service.auth.admin.deleteUser(user.id);
    if (error) {
      logWarn("account.auth_delete_failed", {
        message: error.message.slice(0, 200),
      });
      return { authDeleted: false };
    }
    return { authDeleted: true };
  }

  return { authDeleted: false };
}
