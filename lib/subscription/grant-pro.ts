import type { SupabaseClient } from "@supabase/supabase-js";

export type GrantProResult =
  | {
      status: "granted";
      userId: string;
      email: string | null;
      nick: string;
      days: number;
      periodEnd: string;
      extended: boolean;
    }
  | {
      status: "skipped_paid";
      userId: string;
      email: string | null;
      nick: string;
    }
  | {
      status: "not_found";
      identifier: string;
    }
  | {
      status: "failed";
      identifier: string;
      error: string;
    };

function clean(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<{ id: string; email: string | null } | null> {
  const wanted = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === wanted,
    );
    if (user) return { id: user.id, email: user.email ?? null };
    if (data.users.length < 1000) break;
  }
  return null;
}

export async function findUserIdByIdentifier(
  supabase: SupabaseClient,
  identifier: string,
): Promise<{ userId: string; email: string | null; nick: string } | null> {
  const value = identifier.trim();
  if (!value) return null;

  if (value.includes("@")) {
    const user = await findAuthUserByEmail(supabase, value);
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("nick, nickname")
      .eq("id", user.id)
      .maybeSingle();
    return {
      userId: user.id,
      email: user.email,
      nick: clean(String(profile?.nick || profile?.nickname || "bez nicku")),
    };
  }

  const pattern = escapeLike(value);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nick, nickname")
    .or(`nick.ilike.${pattern},nickname.ilike.${pattern}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!profile?.id) return null;

  const { data: userData } = await supabase.auth.admin.getUserById(
    String(profile.id),
  );
  return {
    userId: String(profile.id),
    email: userData.user?.email ?? null,
    nick: clean(String(profile.nick || profile.nickname || "bez nicku")),
  };
}

/**
 * Przyznaje Pro ręcznie (gift). Nie nadpisuje aktywnej płatnej subskrypcji
 * Stripe; istniejący gift wydłuża od obecnej daty końca.
 */
export async function grantProToUser(
  supabase: SupabaseClient,
  input: {
    userId: string;
    email: string | null;
    nick: string;
    days?: number;
    reason?: string;
  },
): Promise<GrantProResult> {
  const days = Math.max(1, Math.min(365, Math.round(input.days ?? 30)));
  const reason = clean(
    input.reason || "rekompensata przyznana przez administratora",
  ).slice(0, 300);

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select(
      "id, subscription_status, subscription_current_period_end, stripe_subscription_id, pro_source",
    )
    .eq("id", input.userId)
    .maybeSingle();

  if (error) {
    return { status: "failed", identifier: input.userId, error: error.message };
  }

  let profile = profileData;
  if (!profile) {
    const fallbackNick = `gracz_${input.userId.replace(/-/g, "")}`;
    const { error: insertError } = await supabase.from("profiles").insert({
      id: input.userId,
      nick: fallbackNick,
      nickname: fallbackNick,
      xp: 0,
      level: 1,
    });
    if (insertError) {
      return {
        status: "failed",
        identifier: input.userId,
        error: insertError.message,
      };
    }
    const created = await supabase
      .from("profiles")
      .select(
        "id, subscription_status, subscription_current_period_end, stripe_subscription_id, pro_source",
      )
      .eq("id", input.userId)
      .maybeSingle();
    if (created.error || !created.data) {
      return {
        status: "failed",
        identifier: input.userId,
        error: created.error?.message ?? "Profil użytkownika nie istnieje.",
      };
    }
    profile = created.data;
  }

  const isPaidStripe =
    Boolean(profile.stripe_subscription_id) &&
    profile.pro_source === "stripe" &&
    (profile.subscription_status === "active" ||
      profile.subscription_status === "trialing");

  if (isPaidStripe) {
    return {
      status: "skipped_paid",
      userId: input.userId,
      email: input.email,
      nick: input.nick,
    };
  }

  const now = Date.now();
  const currentEnd = profile.subscription_current_period_end
    ? Date.parse(profile.subscription_current_period_end)
    : Number.NaN;
  const extended =
    (profile.pro_source === "gift" || profile.pro_source === "referral") &&
    Number.isFinite(currentEnd) &&
    currentEnd > now;
  const base = extended ? currentEnd : now;
  const periodEnd = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: "pro",
      subscription_current_period_end: periodEnd,
      subscription_cancel_at_period_end: false,
      pro_source: "gift",
      pro_granted_reason: reason,
    })
    .eq("id", input.userId);

  if (updateError) {
    return {
      status: "failed",
      identifier: input.userId,
      error: updateError.message,
    };
  }

  return {
    status: "granted",
    userId: input.userId,
    email: input.email,
    nick: input.nick,
    days,
    periodEnd,
    extended,
  };
}
