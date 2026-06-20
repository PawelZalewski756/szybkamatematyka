import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error("Brak Supabase w .env.local");

  const supabase = createClient(url, key);
  const tables = ["tasks", "materials", "arkusze", "zadania"] as const;

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    console.log(`${table}: ${error ? error.message : count ?? 0}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
