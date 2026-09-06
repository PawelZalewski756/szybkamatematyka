import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

/** Miesięczny limit zapytań (hint / grade / ask) dla kont bez Pro. */
export const FREE_MONTHLY_ASSIST_LIMIT = 10;

export type AssistQuotaSnapshot = {
  isPro: boolean;
  /** YYYY-MM (Europe/Warsaw) */
  period: string;
  periodLabel: string;
  used: number;
  /** null = bez limitu (Pro) */
  limit: number | null;
  remaining: number | null;
};

export function currentAssistPeriod(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
  }).format(now);
}

export function assistPeriodLabel(period: string): string {
  const [yearRaw, monthRaw] = period.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return period;
  return new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
}

function proQuota(period: string): AssistQuotaSnapshot {
  return {
    isPro: true,
    period,
    periodLabel: assistPeriodLabel(period),
    used: 0,
    limit: null,
    remaining: null,
  };
}

type ProfileQuotaRow = {
  ai_assist_period?: string | null;
  ai_assist_count?: number | null;
};

function readUsed(row: ProfileQuotaRow | null | undefined, period: string): number {
  if (!row || row.ai_assist_period !== period) return 0;
  return Math.max(0, Number(row.ai_assist_count) || 0);
}

function freeQuota(period: string, used: number): AssistQuotaSnapshot {
  const remaining = Math.max(0, FREE_MONTHLY_ASSIST_LIMIT - used);
  return {
    isPro: false,
    period,
    periodLabel: assistPeriodLabel(period),
    used,
    limit: FREE_MONTHLY_ASSIST_LIMIT,
    remaining,
  };
}

export async function readAssistQuota(
  userId: string,
  isPro: boolean,
): Promise<AssistQuotaSnapshot> {
  const period = currentAssistPeriod();
  if (isPro) return proQuota(period);

  const sb = getServiceSupabaseOrNull();
  if (!sb) return freeQuota(period, 0);

  const { data, error } = await sb
    .from("profiles")
    .select("ai_assist_period, ai_assist_count")
    .eq("id", userId)
    .maybeSingle();

  if (error && isPostgrestUndefinedColumnError(error as PostgrestError)) {
    console.warn("[task-assist-quota] Brak kolumn ai_assist_* — uruchom migrację SQL.");
    return freeQuota(period, 0);
  }

  if (error) {
    console.error("[task-assist-quota] read failed:", error);
    return freeQuota(period, 0);
  }

  return freeQuota(period, readUsed(data as ProfileQuotaRow, period));
}

export type ConsumeAssistQuotaResult =
  | { ok: true; quota: AssistQuotaSnapshot }
  | { ok: false; quota: AssistQuotaSnapshot; error: string };

/** Rezerwuje jedno zapytanie (tylko free). Pro pomija limit miesięczny. */
export async function consumeAssistQuota(
  userId: string,
  isPro: boolean,
): Promise<ConsumeAssistQuotaResult> {
  const period = currentAssistPeriod();
  if (isPro) {
    return { ok: true, quota: proQuota(period) };
  }

  const sb = getServiceSupabaseOrNull();
  if (!sb) {
    return {
      ok: false,
      quota: freeQuota(period, FREE_MONTHLY_ASSIST_LIMIT),
      error: "Asystent jest chwilowo niedostępny.",
    };
  }

  const { data, error } = await sb.rpc("consume_ai_assist_quota", {
    p_user_id: userId,
    p_period: period,
    p_limit: FREE_MONTHLY_ASSIST_LIMIT,
  });

  if (error && isPostgrestUndefinedColumnError(error as PostgrestError)) {
    return {
      ok: false,
      quota: freeQuota(period, 0),
      error:
        "Limit zapytań wymaga aktualizacji bazy — skontaktuj się z administratorem.",
    };
  }

  if (error) {
    console.error("[task-assist-quota] atomic consume failed:", error);
    return {
      ok: false,
      quota: freeQuota(period, 0),
      error: "Nie udało się sprawdzić limitu zapytań.",
    };
  }

  const result = (
    Array.isArray(data) ? data[0] : data
  ) as { allowed?: boolean; period?: string; used?: number } | null | undefined;
  const used = Math.max(0, Number(result?.used) || 0);
  const quota = freeQuota(result?.period ?? period, used);

  if (!result?.allowed) {
    return {
      ok: false,
      quota,
      error: `Wykorzystałeś ${FREE_MONTHLY_ASSIST_LIMIT} darmowych zapytań w ${assistPeriodLabel(period)}. Plan Pro daje nielimitowany dostęp.`,
    };
  }

  return { ok: true, quota };
}
