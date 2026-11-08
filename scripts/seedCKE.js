/**
 * Seed: przykładowy arkusz CKE + 3 zadania w Supabase.
 * Uruchom: node scripts/seedCKE.js
 * (wymaga migracji init_baza_zadan.sql oraz .env.local)
 */

const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ARKUSZ_NAZWA = "Matura Maj 2024";
const ARKUSZ_TYP = "matura";
const ARKUSZ_ROK = 2024;
const ARKUSZ_MIESIAC = 5;

/** 3 przykładowe zadania - tylko numer, dział i treść polecenia. */
const PRZYKLADOWE_ZADANIA = [
  {
    numer_zadania: 1,
    dzial: "Procenty",
    tresc:
      "Cena kurtki po obniżce o 20% wynosi 240 zł. Jaka była cena kurtki przed obniżką?",
  },
  {
    numer_zadania: 2,
    dzial: "Funkcje",
    tresc:
      "Funkcja liniowa f jest określona wzorem f(x) = 2x − 3. Oblicz f(5).",
  },
  {
    numer_zadania: 3,
    dzial: "Geometria",
    tresc:
      "W trójkącie prostokątnym przyprostokątne mają długości 6 cm i 8 cm. Oblicz długość przeciwprostokątnej.",
  },
];

/** Rozwiązania (kolumna wymagana w DB - uzupełniane przy seedzie). */
const ROZWIAZANIA = {
  1: "Krok 1: Po obniżce zostaje 80% ceny początkowej.\nKrok 2: 0,8x = 240 → x = 300.\nOdpowiedź: 300 zł.",
  2: "Krok 1: Podstaw x = 5.\nKrok 2: f(5) = 2·5 − 3 = 10 − 3 = 7.\nOdpowiedź: 7.",
  3: "Krok 1: Twierdzenie Pitagorasa: c² = 6² + 8² = 36 + 64 = 100.\nKrok 2: c = 10.\nOdpowiedź: 10 cm.",
};

function createSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w .env.local",
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Znajdź arkusz „Matura Maj 2024” lub utwórz go.
 * @returns {Promise<string>} id arkusza (uuid)
 */
async function getOrCreateArkuszId(supabase) {
  const { data: existing, error: selectError } = await supabase
    .from("arkusze")
    .select("id")
    .eq("nazwa", ARKUSZ_NAZWA)
    .eq("typ", ARKUSZ_TYP)
    .eq("rok", ARKUSZ_ROK)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Błąd odczytu arkusza: ${selectError.message}`);
  }

  if (existing?.id) {
    console.log(`✓ Arkusz już istnieje (id: ${existing.id})`);
    return existing.id;
  }

  const { data: created, error: insertError } = await supabase
    .from("arkusze")
    .insert({
      nazwa: ARKUSZ_NAZWA,
      typ: ARKUSZ_TYP,
      rok: ARKUSZ_ROK,
      miesiac: ARKUSZ_MIESIAC,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Błąd tworzenia arkusza: ${insertError.message}`);
  }

  console.log(`✓ Utworzono arkusz „${ARKUSZ_NAZWA}” (id: ${created.id})`);
  return created.id;
}

async function seedDatabase() {
  const supabase = createSupabaseClient();
  console.log("Łączenie z Supabase…");

  const arkuszId = await getOrCreateArkuszId(supabase);

  let inserted = 0;
  let skipped = 0;

  for (const zadanie of PRZYKLADOWE_ZADANIA) {
    const { error } = await supabase.from("zadania").insert({
      arkusz_id: arkuszId,
      numer_zadania: zadanie.numer_zadania,
      dzial: zadanie.dzial,
      tresc: zadanie.tresc,
      rozwiazanie:
        ROZWIAZANIA[zadanie.numer_zadania] ??
        "Rozwiązanie do uzupełnienia w panelu /admin.",
    });

    if (error) {
      if (error.code === "23505" || error.message.includes("duplicate")) {
        console.log(
          `  ⊘ Zadanie ${zadanie.numer_zadania} - już istnieje, pomijam.`,
        );
        skipped += 1;
        continue;
      }
      throw new Error(
        `Błąd zapisu zadania ${zadanie.numer_zadania}: ${error.message}`,
      );
    }

    console.log(`  ✓ Zadanie ${zadanie.numer_zadania} (${zadanie.dzial})`);
    inserted += 1;
  }

  console.log(
    `\nGotowe. Arkusz: ${ARKUSZ_NAZWA} | dodano: ${inserted} | pominięto: ${skipped}`,
  );
}

seedDatabase().catch((err) => {
  console.error("\n✗ Seed nie powiódł się:");
  console.error(err instanceof Error ? err.message : err);
  if (
    err instanceof Error &&
    /could not find the table|relation.*does not exist/i.test(err.message)
  ) {
    console.error(
      "\nUruchom najpierw migrację: supabase/migrations/init_baza_zadan.sql",
    );
  }
  process.exit(1);
});
