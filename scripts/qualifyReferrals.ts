import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Ręczne uruchomienie kwalifikacji poleceń (np. na stagingu).
 * W produkcji robi to cron `/api/cron/referrals`.
 *
 *   npm run referrals:qualify
 */
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error(
    "Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY w środowisku.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.rpc("qualify_referrals");

if (error) {
  console.error("Kwalifikacja nie powiodła się:", error.message);
  process.exit(1);
}

const row = (Array.isArray(data) ? data[0] : data) as
  | { qualified?: number; rewarded?: number }
  | undefined;

console.log(
  `Zakwalifikowano: ${Number(row?.qualified) || 0}, nagród: ${Number(row?.rewarded) || 0}`,
);
