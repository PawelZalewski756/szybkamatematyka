/**
 * Import arkusza maturalnego CKE (maj 2024, poziom podstawowy) → Supabase.
 *
 *   npm run seed:cke-matura
 *   npm run seed:cke-matura -- --replace
 */

import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  CKE_MATURA_2024_MAJ_META,
  CKE_MATURA_2024_MAJ_ZADANIA,
} from "../lib/baza-zadan/cke/matura-2024-maj-podstawowa";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SOURCE_PREFIX = "cke-m24-maj-p";

function parseArgs(): { replace: boolean } {
  let replace = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === "--replace") replace = true;
  }
  return { replace };
}

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w .env.local",
    );
  }
  return createClient(url, key);
}

function sourceId(numer: number): string {
  return `${SOURCE_PREFIX}-z${String(numer).padStart(2, "0")}`;
}

async function getOrCreateArkusz(supabase: SupabaseClient): Promise<string> {
  const { nazwa, typ, rok, miesiac } = CKE_MATURA_2024_MAJ_META;

  const { data: existing, error: selectError } = await supabase
    .from("arkusze")
    .select("id")
    .eq("nazwa", nazwa)
    .eq("typ", typ)
    .eq("rok", rok)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);
  if (existing?.id) {
    console.log(`✓ Arkusz już istnieje: „${nazwa}”`);
    return existing.id;
  }

  const { data: created, error: insertError } = await supabase
    .from("arkusze")
    .insert({ nazwa, typ, rok, miesiac })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);
  console.log(`✓ Utworzono arkusz: „${nazwa}”`);
  return created.id;
}

async function deleteBySourceId(
  supabase: SupabaseClient,
  sid: string,
): Promise<void> {
  const { error } = await supabase.from("zadania").delete().eq("source_id", sid);
  if (error && !/source_id|column/i.test(error.message)) {
    throw new Error(error.message);
  }
}

async function existsBySourceId(
  supabase: SupabaseClient,
  sid: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("zadania")
    .select("id")
    .eq("source_id", sid)
    .maybeSingle();

  if (error) {
    if (/source_id|column/i.test(error.message)) return false;
    throw new Error(error.message);
  }
  return Boolean(data?.id);
}

async function main() {
  const { replace } = parseArgs();
  const supabase = createSupabase();
  const arkuszId = await getOrCreateArkusz(supabase);

  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (const z of CKE_MATURA_2024_MAJ_ZADANIA) {
    const sid = sourceId(z.numer);

    if (replace) {
      await deleteBySourceId(supabase, sid);
    } else if (await existsBySourceId(supabase, sid)) {
      console.log(`  ⊘ Zadanie ${z.numer} — już w bazie (${sid})`);
      skipped += 1;
      continue;
    }

    const row: Record<string, unknown> = {
      arkusz_id: arkuszId,
      numer_zadania: z.numer,
      dzial: z.dzial,
      tresc: z.tresc.trim(),
      rozwiazanie: z.rozwiazanie.trim(),
      source_id: sid,
    };

    const { error } = await supabase.from("zadania").insert(row);

    if (error) {
      if (!/source_id/i.test(error.message)) {
        throw new Error(`Zadanie ${z.numer}: ${error.message}`);
      }
      const { error: err2 } = await supabase.from("zadania").insert({
        arkusz_id: arkuszId,
        numer_zadania: z.numer,
        dzial: z.dzial,
        tresc: z.tresc.trim(),
        rozwiazanie: z.rozwiazanie.trim(),
      });
      if (err2) throw new Error(`Zadanie ${z.numer}: ${err2.message}`);
    }

    console.log(`  ✓ Zadanie ${z.numer} (${z.dzial})`);
    if (replace) updated += 1;
    else inserted += 1;
  }

  console.log(
    `\nGotowe — ${CKE_MATURA_2024_MAJ_META.nazwa}\n` +
      `  dodano: ${inserted} | pominięto: ${skipped} | po --replace: ${updated}\n` +
      `  Źródło: ${CKE_MATURA_2024_MAJ_META.ckeUrl}`,
  );
}

main().catch((err) => {
  console.error("\n✗ Import CKE nie powiódł się:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
