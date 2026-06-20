import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { CKE_MATURA_IMPORTABLE_SESSIONS } from "../lib/baza-zadan/cke/matura-podstawowa-sessions";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error("Brak Supabase w .env.local");

  const sb = createClient(url, key);
  const { data: arkusze, error } = await sb
    .from("arkusze")
    .select("id,nazwa,typ,rok,miesiac")
    .order("rok", { ascending: false });

  if (error) throw error;

  const { data: zadania, error: zErr } = await sb
    .from("zadania")
    .select("id,arkusz_id,arkusze!inner(typ,nazwa)")
    .limit(2000);

  if (zErr) throw zErr;

  const byArkusz = new Map<string, number>();
  for (const z of zadania ?? []) {
    const aid = String(z.arkusz_id);
    byArkusz.set(aid, (byArkusz.get(aid) ?? 0) + 1);
  }

  const maturaArkusze = (arkusze ?? []).filter((a) => a.typ === "matura");
  const e8 = (arkusze ?? []).filter((a) => a.typ === "egzamin-8");

  console.log(`Importable sessions (code): ${CKE_MATURA_IMPORTABLE_SESSIONS.length}`);
  console.log(`Arkusze matura w DB: ${maturaArkusze.length}`);
  console.log(`Arkusze E8 w DB: ${e8.length}`);
  console.log(`Zadania pobrane (limit 2000): ${zadania?.length ?? 0}`);

  const missing: string[] = [];
  for (const s of CKE_MATURA_IMPORTABLE_SESSIONS) {
    const found = maturaArkusze.find((a) => a.nazwa === s.nazwa);
    if (!found) {
      missing.push(s.id);
      console.log(`  BRAK arkusza: ${s.id} — ${s.nazwa}`);
      continue;
    }
    const n = byArkusz.get(found.id) ?? 0;
    if (n === 0) console.log(`  PUSTY: ${s.id} (${found.id})`);
    else console.log(`  OK ${s.id}: ${n} zadań`);
  }

  if (missing.length === 0) console.log("\nWszystkie sesje importowalne mają arkusz w DB.");

  const importNames = new Set(CKE_MATURA_IMPORTABLE_SESSIONS.map((s) => s.nazwa));
  const extra = maturaArkusze.filter((a) => !importNames.has(a.nazwa));
  if (extra.length > 0) {
    console.log("\nDodatkowe arkusze matura (nie z listy CKE):");
    for (const a of extra) {
      console.log(`  ${a.rok}: ${a.nazwa} (${byArkusz.get(a.id) ?? 0} zadań)`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
