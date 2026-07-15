/** Ile arkuszy CKE widać bez Pro (reszta z paywallem). */
export const FREE_CMS_SHEETS_VISIBLE = 3;

/** Czy użytkownik może używać filtrów roku/typu w bazie zadań CMS. */
export function canUseAdvancedBazaFilters(isPro: boolean): boolean {
  return isPro;
}

/** Czy pełne rozwiązania krok po kroku są dostępne bez Pro. */
export function canViewFullSolutions(isPro: boolean): boolean {
  return isPro;
}
