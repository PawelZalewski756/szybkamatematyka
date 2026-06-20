/** Porządek sesji w obrębie roku: maj → czerwiec → … (rosnąco po miesiącu). */
export type ArkuszSessionSort = {
  rok: number;
  miesiac: number | null;
};

/** Rok malejąco; w tym samym roku miesiąc rosnąco (standard CKE). */
export function compareArkuszSession(
  a: ArkuszSessionSort,
  b: ArkuszSessionSort,
): number {
  if (b.rok !== a.rok) return b.rok - a.rok;
  const ma = a.miesiac ?? 99;
  const mb = b.miesiac ?? 99;
  return ma - mb;
}

export function sessionFromGroup<T extends { arkusz: ArkuszSessionSort }>(
  sample: T | undefined,
): ArkuszSessionSort {
  if (!sample) return { rok: 0, miesiac: null };
  return {
    rok: sample.arkusz.rok,
    miesiac: sample.arkusz.miesiac,
  };
}
