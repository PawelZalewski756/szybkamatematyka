import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import {
  normalizeRow,
  sortZadania,
  type FetchZadaniaResult,
  type ZadaniaFilters,
} from "@/lib/supabase/baza-zadan";

/**
 * Pobieranie zadań RAZEM z `rozwiazanie` - wyłącznie serwerowo.
 *
 * Po migracji `20261117190000_zadania_rozwiazanie_service_only.sql` anon
 * i authenticated nie mają już prawa SELECT na kolumnie `rozwiazanie`.
 * Czytamy ją kluczem service_role, po sprawdzeniu planu Pro w route handlerze.
 *
 * Ten moduł wolno importować tylko z kodu serwerowego (`app/api/**`).
 * Nie importuj go w komponencie klienckim - trafiłby do bundla przeglądarki.
 */

const SELECT_WITH_MIESIAC = `
  id,
  arkusz_id,
  numer_zadania,
  dzial,
  tresc,
  rozwiazanie,
  created_at,
  arkusz:arkusze!inner (
    id,
    nazwa,
    typ,
    rok,
    miesiac
  )
`;

const SELECT_LEGACY = `
  id,
  arkusz_id,
  numer_zadania,
  dzial,
  tresc,
  rozwiazanie,
  created_at,
  arkusz:arkusze!inner (
    id,
    nazwa,
    typ,
    rok
  )
`;

export async function fetchZadaniaWithSolutions(
  filters: ZadaniaFilters = {},
): Promise<FetchZadaniaResult> {
  const supabase = getServiceSupabaseOrNull();
  if (!supabase) {
    return {
      data: [],
      error: "Brak SUPABASE_SERVICE_ROLE_KEY - klucz odpowiedzi jest niedostępny.",
    };
  }

  const run = async (select: string) => {
    let query = supabase
      .from("zadania")
      .select(select)
      .order("numer_zadania", { ascending: true });
    if (filters.arkuszId) {
      query = query.eq("arkusz_id", filters.arkuszId);
    }
    return query;
  };

  let { data, error } = await run(SELECT_WITH_MIESIAC);
  if (error && /miesiac/i.test(error.message)) {
    ({ data, error } = await run(SELECT_LEGACY));
  }
  if (error) {
    return { data: [], error: error.message };
  }

  const rows = (data ?? [])
    .map((row) => normalizeRow(row as unknown as Record<string, unknown>))
    .filter((row) => row !== null);

  return { data: sortZadania(rows), error: null };
}
