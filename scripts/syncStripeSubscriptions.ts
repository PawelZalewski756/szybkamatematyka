import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";
import { syncSubscriptionToProfile } from "../lib/stripe/subscription-sync";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Nadrabia płatności: pobiera wszystkie subskrypcje ze Stripe i zapisuje ich
 * stan w profilach. Użycie: npx tsx scripts/syncStripeSubscriptions.ts
 * Wymaga STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
async function main() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("Brak STRIPE_SECRET_KEY");

  const stripe = new Stripe(key);
  let synced = 0;
  let skipped = 0;

  for await (const subscription of stripe.subscriptions.list({
    status: "all",
    limit: 100,
  })) {
    if (!subscription.metadata?.supabase_user_id) {
      console.warn("POMINIETO (brak supabase_user_id):", subscription.id);
      skipped++;
      continue;
    }
    await syncSubscriptionToProfile(subscription);
    console.log("OK", subscription.id, subscription.status);
    synced++;
  }

  console.log(`Gotowe. Zsynchronizowano: ${synced}, pominieto: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
