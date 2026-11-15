import type { PostgrestError } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;
const PARALLEL_PAGES = 6;

type PageResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

/**
 * Pobiera wszystkie wiersze stronicowaniem (PostgREST domyślnie max 1000/stronę).
 * Strony lecą falami po PARALLEL_PAGES, żeby nie czekać sekwencyjnie na 13 rund
 * (drzewo treningu ma ponad 12 tys. zadań).
 */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<{ rows: T[]; error: PostgrestError | null }> {
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const offsets = Array.from(
      { length: PARALLEL_PAGES },
      (_, index) => from + index * PAGE_SIZE,
    );
    const pages = await Promise.all(
      offsets.map((offset) => fetchPage(offset, offset + PAGE_SIZE - 1)),
    );

    let done = false;
    for (const result of pages) {
      if (result.error) return { rows, error: result.error };
      const page = result.data ?? [];
      rows.push(...page);
      if (page.length < PAGE_SIZE) {
        done = true;
        break;
      }
    }
    if (done) break;
    from += PARALLEL_PAGES * PAGE_SIZE;
  }

  return { rows, error: null };
}
