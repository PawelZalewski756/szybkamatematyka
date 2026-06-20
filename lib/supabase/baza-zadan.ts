import { buildArkuszNazwa } from "@/lib/baza-zadan/arkusz-format";
import type { TypEgzaminu } from "@/lib/baza-zadan/dzialy";
import { getSupabase, getSupabaseOrNull } from "@/lib/supabase";

export type ArkuszRow = {
  id: string;
  nazwa: string;
  typ: TypEgzaminu;
  rok: number;
  miesiac: number | null;
  created_at: string;
};

export type ZadanieRow = {
  id: string;
  arkusz_id: string;
  numer_zadania: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
  created_at: string;
};

export type ArkuszEmbed = Pick<ArkuszRow, "id" | "nazwa" | "typ" | "rok" | "miesiac">;

export type ZadanieWithArkusz = ZadanieRow & {
  arkusz: ArkuszEmbed;
};

export type ZadaniaFilters = {
  typ?: TypEgzaminu | "all";
  rok?: number | "all";
  dzial?: string | "all";
};

export type FetchZadaniaResult = {
  data: ZadanieWithArkusz[];
  error: string | null;
};

const ZADANIA_SELECT_WITH_MIESIAC = `
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

const ZADANIA_SELECT_LEGACY = `
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

function normalizeRow(raw: Record<string, unknown>): ZadanieWithArkusz | null {
  const arkuszRaw = raw.arkusz;
  const arkusz = Array.isArray(arkuszRaw)
    ? (arkuszRaw[0] as ArkuszEmbed | undefined)
    : (arkuszRaw as ArkuszEmbed | undefined);

  if (!arkusz?.id || !arkusz.typ) return null;

  return {
    id: String(raw.id),
    arkusz_id: String(raw.arkusz_id),
    numer_zadania: Number(raw.numer_zadania),
    dzial: String(raw.dzial ?? ""),
    tresc: String(raw.tresc ?? ""),
    rozwiazanie: String(raw.rozwiazanie ?? ""),
    created_at: String(raw.created_at ?? ""),
    arkusz: {
      id: arkusz.id,
      nazwa: arkusz.nazwa ?? "Arkusz",
      typ: arkusz.typ,
      rok: Number(arkusz.rok),
      miesiac:
        arkusz.miesiac != null && !Number.isNaN(Number(arkusz.miesiac))
          ? Number(arkusz.miesiac)
          : null,
    },
  };
}

function sortZadania(rows: ZadanieWithArkusz[]): ZadanieWithArkusz[] {
  return [...rows].sort((a, b) => {
    if (b.arkusz.rok !== a.arkusz.rok) return b.arkusz.rok - a.arkusz.rok;
    const ma = a.arkusz.miesiac ?? 0;
    const mb = b.arkusz.miesiac ?? 0;
    if (mb !== ma) return mb - ma;
    const nameCmp = a.arkusz.nazwa.localeCompare(b.arkusz.nazwa, "pl");
    if (nameCmp !== 0) return nameCmp;
    return a.numer_zadania - b.numer_zadania;
  });
}

function applyFilters(
  rows: ZadanieWithArkusz[],
  filters: ZadaniaFilters,
): ZadanieWithArkusz[] {
  let result = rows;
  if (filters.typ && filters.typ !== "all") {
    result = result.filter((z) => z.arkusz.typ === filters.typ);
  }
  if (filters.rok && filters.rok !== "all") {
    result = result.filter((z) => z.arkusz.rok === filters.rok);
  }
  return result;
}

export async function fetchArkusze(): Promise<ArkuszRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("arkusze")
    .select("*")
    .order("rok", { ascending: false })
    .order("miesiac", { ascending: false, nullsFirst: false })
    .order("nazwa", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ArkuszRow[];
}

export async function createArkusz(input: {
  typ: TypEgzaminu;
  rok: number;
  miesiac: number;
}): Promise<ArkuszRow> {
  const supabase = getSupabase();
  const nazwa = buildArkuszNazwa(input.miesiac, input.rok);
  const { data, error } = await supabase
    .from("arkusze")
    .insert({
      nazwa,
      typ: input.typ,
      rok: input.rok,
      miesiac: input.miesiac,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ArkuszRow;
}

export async function createZadanie(input: {
  arkusz_id: string;
  numer_zadania: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
}): Promise<ZadanieRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("zadania")
    .insert({
      arkusz_id: input.arkusz_id,
      numer_zadania: input.numer_zadania,
      dzial: input.dzial,
      tresc: input.tresc.trim(),
      rozwiazanie: input.rozwiazanie.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as ZadanieRow;
}

/** Bezpieczne pobranie zadań — nie rzuca; zwraca pustą tablicę przy błędzie. */
export async function fetchZadaniaSafe(
  filters: ZadaniaFilters = {},
): Promise<FetchZadaniaResult> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return {
      data: [],
      error:
        "Brak konfiguracji Supabase. Uzupełnij NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY w .env.local.",
    };
  }

  const pageSize = 1000;

  const runQuery = async (select: string, from: number, to: number) => {
    let query = supabase
      .from("zadania")
      .select(select)
      .order("numer_zadania", { ascending: true })
      .range(from, to);

    if (filters.dzial && filters.dzial !== "all") {
      query = query.eq("dzial", filters.dzial);
    }

    return query;
  };

  const fetchAllPages = async (select: string) => {
    const rows: ZadanieWithArkusz[] = [];
    let from = 0;

    for (;;) {
      const { data, error } = await runQuery(select, from, from + pageSize - 1);
      if (error) {
        return {
          rows: null as ZadanieWithArkusz[] | null,
          errorMessage: error.message,
          errorCode: error.code,
        };
      }

      const page = (data ?? [])
        .map((row) => normalizeRow(row as unknown as Record<string, unknown>))
        .filter((row): row is ZadanieWithArkusz => row != null);

      rows.push(...page);
      if (page.length < pageSize) break;
      from += pageSize;
    }

    return { rows, errorMessage: null, errorCode: null };
  };

  try {
    let result = await fetchAllPages(ZADANIA_SELECT_WITH_MIESIAC);

    if (
      result.errorMessage &&
      (result.errorMessage.includes("miesiac") ||
        result.errorMessage.includes("column") ||
        result.errorCode === "42703")
    ) {
      result = await fetchAllPages(ZADANIA_SELECT_LEGACY);
    }

    if (result.errorMessage) {
      return { data: [], error: result.errorMessage };
    }

    return {
      data: sortZadania(applyFilters(result.rows ?? [], filters)),
      error: null,
    };
  } catch (e) {
    return {
      data: [],
      error:
        e instanceof Error
          ? e.message
          : "Nie udało się połączyć z bazą danych.",
    };
  }
}

export async function fetchZadania(
  filters: ZadaniaFilters = {},
): Promise<ZadanieWithArkusz[]> {
  const { data, error } = await fetchZadaniaSafe(filters);
  if (error) throw new Error(error);
  return data;
}

export async function fetchDistinctLataSafe(): Promise<{
  years: number[];
  error: string | null;
}> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return { years: [], error: "Brak konfiguracji Supabase." };
  }

  try {
    const { data, error } = await supabase
      .from("arkusze")
      .select("rok")
      .order("rok", { ascending: false });

    if (error) return { years: [], error: error.message };

    const years = [
      ...new Set(
        (data ?? [])
          .map((r) => r.rok as number)
          .filter((y) => typeof y === "number" && !Number.isNaN(y)),
      ),
    ];
    return { years, error: null };
  } catch (e) {
    return {
      years: [],
      error:
        e instanceof Error ? e.message : "Nie udało się pobrać listy lat.",
    };
  }
}

export async function fetchDistinctLata(): Promise<number[]> {
  const { years, error } = await fetchDistinctLataSafe();
  if (error) throw new Error(error);
  return years;
}
