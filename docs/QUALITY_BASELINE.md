# Baseline jakości — 2026-08-24

Punkt odniesienia dla roadmapy produkcyjnej. Pomiar wykonano na `master`
(`72de113`) bez zmiennych produkcyjnego Supabase.

## Wyniki

| Kontrola | Wynik |
| --- | --- |
| ESLint | przechodzi |
| TypeScript (`tsc --noEmit`) | przechodzi |
| Vitest | 32 pliki, 261 testów, wszystkie przechodzą |
| Next.js build | przechodzi, 741 stron |
| Audyt rozwiązań CKE | 591/591 bez placeholderów |
| Audyt cache zadań | 1100 zadań, 2 uszkodzone rozwiązania |
| Audyt pytań MC | 1866 zadań, 0 wykrytych problemów strukturalnych |
| Audyt teorii/Supabase | pominięty — brak poświadczeń w środowisku |
| Playwright | nie uruchomił testów — brak binariów Chromium |
| `npm audit --omit=dev` | 4 podatności high |

## Wydajność

- `.next/static/chunks`: około 4,0 MB.
- Największy chunk klienta: około 1,3 MB.
- `cke-archive.generated.ts`: około 1,5 MB.
- `data/cke-matura-cache`: około 1,1 MB.

## Potwierdzone problemy blokujące

1. Eksporter statycznego archiwum ustawia `correctIndex: 0` dla każdego
   zadania, niezależnie od rozwiązania.
2. Dwa zadania w cache ciągów arytmetycznych zawierają samokorektę modelu
   i sprzeczne rozwiązania.
3. Produkcyjne zależności zawierają cztery podatności high.
4. E2E wymaga instalacji Chromium zarówno lokalnie, jak i w CI.

## Ograniczenie audytu bazy

W środowisku nie ma `.env.local` ani integracji Supabase pozwalającej na
read-only odczyt katalogów systemowych. Stan faktycznie wdrożonych polityk
RLS, triggerów i migracji musi zostać zweryfikowany przed zastosowaniem
migracji naprawczych. Kod repozytorium traktujemy jako oczekiwany stan,
nie jako dowód stanu produkcyjnej bazy.

