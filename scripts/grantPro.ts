import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npx tsx scripts/grantPro.ts user@email.com");
  process.exit(1);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: users, error: listErr } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  const user = users.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.error("NO_USER", email);
    process.exit(1);
  }

  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { data, error } = await sb
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: "pro",
      subscription_current_period_end: periodEnd.toISOString(),
      subscription_cancel_at_period_end: false,
    })
    .eq("id", user.id)
    .select(
      "id, nick, subscription_status, subscription_plan, subscription_current_period_end",
    )
    .single();

  if (error) {
    console.error("UPDATE_FAILED", error.message, error.code, error.details);
    process.exit(1);
  }

  console.log("OK", JSON.stringify({ email, userId: user.id, profile: data }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
