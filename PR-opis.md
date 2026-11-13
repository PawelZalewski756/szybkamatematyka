## Problem

W treningu (i nie tylko) zadania pokazywały zepsuty LaTeX:

1. `Oblicz wartość wyrażenia 50 - (24 ÷ 6 + 2 × 5)$` - nadmiarowy `$` na końcu, formuła nie jest matematyką.
2. `15 + (5imes3)² - 10` - zamiast `\times` renderowało się `imes` (znak tabulatora zjadł ukośnik).

## Przyczyny

1. **`\times` zjedzone przez JSON.** Model zwraca LaTeX z pojedynczym ukośnikiem (`"\times"`). Dla parsera JSON to poprawna sekwencja `\t`, więc `5\times3` staje się `5<TAB>imes3`. Analogicznie `\frac` → FF + `rac`, `\beta` → BS + `eta`, `\theta`, `\right`, `\neq`.
2. **Niezbalansowane `$`.** Nadmiarowy `$` po `$...$` powodował, że KaTeX dostawał `$` w środku formuły (czerwony błąd) albo cała formuła zostawała tekstem i pokazywała surowe `\div` / `\times`.
3. Tło: wyjaśnienia zadań renderowały `**Odpowiedź:**` z widocznymi gwiazdkami, a błąd KaTeX pokazywał surowy LaTeX na czerwono.

## Zmiany

- **`lib/math/normalize-math-text.ts`** (nowy): naprawa znaków sterujących na komendy LaTeX (z ochroną polskich nowych linii, np. `\ni tworzenie`), balansowanie `$` (domykanie na końcu linii, usuwanie nadmiarowych), owijanie surowego LaTeX-a w `$$`, awaryjna zamiana LaTeX-a na czytelny tekst (`latexToPlainText`).
- **Renderowanie**: `splitMathText` normalizuje treść, więc poprawka działa od razu dla wszystkich miejsc (trening, pojedynki, minigry, powtórki, sprawdziany, arkusze, druk). `MathText` przy błędzie KaTeX pokazuje czytelny tekst zamiast czerwonego błędu oraz obsługuje `**pogrubienie**`. `TheoryMarkdown` normalizuje markdown przed `remark-math`.
- **Generowanie**: `format-tasks` naprawia ukośniki w JSON przed `JSON.parse` i normalizuje treść/opcje/wyjaśnienia; to samo w `format-theory`, `format-solution`, `format-task-assist`.
- **`scripts/repairFormatting.ts`** + `npm run repair:formatting`: audyt i naprawa istniejących danych (cache oraz tabele `tasks` / `materials`), domyślnie dry-run, `--apply` zapisuje.
- Poprawione 2 wpisy w `data/cke-e8-cache` z brakującym `$`.
- **Testy**: aktualizacje i nowe pliki testów (464 testów łącznie), m.in. regresje dokładnie dla obu zrzutów ekranu, realnych stringów z bazy i render przez `react-dom/server`.

## Test plan

- `npm test` - 464 testów, wszystkie zielone.
- `npm run build` (`next build`) - zielony.
- `npm run repair:formatting` (dry-run) - cache bez problemów.

## Uwaga wdrożeniowa

Nowe zadania będą już zapisywane poprawnie. Istniejące wiersze w Supabase są naprawiane w locie przy renderowaniu, a docelowo można je wyczyścić jednorazowo:

```bash
npm run repair:formatting -- --apply
```

(wymaga `SUPABASE_SERVICE_ROLE_KEY` w `.env.local`)

## Aktualizacja: audyt całej bazy produkcyjnej

Po wypchnięciu brancha sprawdziłem przez publiczne API Supabase **wszystkie 12 472 zadania i 59 materiałów**:

- 10 000 zadań ma niewidoczne znaki ZWSP/ZWNJ na końcu treści,
- 75 zadań ma zjedzone komendy (`\times`, `\frac`, `\theta`, `\beta`, `\right`),
- 38 zadań ma `\begin` / `\right` zamienione na spację (` egin{cases}`, ` ight)`),
- 4 zadania mają potrójne `$` (`$ $ $ ... $ $`).

Po normalizacji: **0 nieudanych formuł KaTeX i 0 resztek surowego LaTeX-a** w całej bazie.

Drugi commit dokłada:

- usuwanie ZWSP/ZWNJ/BOM,
- naprawę ` egin{cases}` → `\begin{cases}` oraz ` ight` → `\right`,
- wykrywanie tych przypadków w `findMathTextIssues` (czyli także w `npm run repair:formatting`),
- ochronę przed traktowaniem dosłownego `\n` z prozy jako komendy LaTeX (nie zamienia już `...\nMnożenie` w matematykę),
- testy regresyjne na realnych stringach z bazy.

## Bezpieczeństwo: wyłączony plik seedowy

`supabase/migrations/add_tasks_materials_insert.sql` nadawał rolom `anon` i
`authenticated` pełne INSERT/UPDATE/DELETE na `tasks` i `materials`. Klucz
publiczny Supabase jest w bundle'u aplikacji, więc uruchomienie tego pliku
pozwalało każdemu usunąć bazę zadań. Plik jest teraz **no-op**, a dokumentacja
(`scripts/README.md`, `supabase/README.md`, `docs/DEPLOY.md`) nie każe go już
uruchamiać.

Stan produkcji sprawdzony: `public.is_admin()` istnieje (RPC zwraca `false` dla
anon), a `20260906220000_production_hardening.sql` zostawia na `tasks` i
`materials` tylko SELECT oraz zapis dla `authenticated` + `is_admin()`. Luka nie
była więc otwarta - problemem był sam plik i instrukcje, które mogły ją otworzyć
przy kolejnym seedzie. Potwierdzone próbą zapisu kluczem anon: PostgREST zwraca
`42501` (row-level security), więc INSERT do `tasks` jest blokowany. Nowy test
`tests/supabase-policies.test.ts` pilnuje, żeby plik seedowy znowu nie otworzył
zapisu.


