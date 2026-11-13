# Skrypty

## `npm run seed:auto` - pełna automatyzacja

Pobiera zadania z **katalogu treningowego** w aplikacji (~1275) - to **nie** są oryginalne skany arkuszy CKE.

Dla każdego zadania:

1. Zapisuje treść z opcjami A/B/C/D do Supabase
2. Rozwiązanie: **najpierw z katalogu** (spójne z poprawną odpowiedzią), Gemini tylko gdy brak
3. Format rozwiązania: `Krok 1:`, `Krok 2:`, `Odpowiedź: …` - bez LaTeX

**Wymagania:** `.env.local` z `GEMINI_API_KEY`, Supabase URL/KEY, migracje SQL (w tym `add_zadania_source_id.sql`).

```bash
# Wszystko: arkusze treningowe + reszta katalogu po działach
npm run seed:auto

# Test - podmień 5 wcześniejszych importów
npm run seed:auto -- --limit=5 --replace

# Wyczyść cały import w Supabase (SQL): migrations/wyczysc_import.sql

# Tylko arkusze treningowe z kodu
npm run seed:auto -- --mode=sheets

# Tylko katalog po działach (bez duplikatów z arkuszy)
npm run seed:auto -- --mode=catalog

# Wolniejsze wywołania API (mniej 429)
npm run seed:auto -- --delay=4000
```

Ponowne uruchomienie **pomija** zadania już zapisane (`source_id` = id z katalogu).

**Uwaga:** Pełny import ~1000 zadań trwa wiele godzin i zużywa limit Gemini - najpierw testuj `--limit=10`.

## `npm run seed:cke-matura` - arkusze maturalne CKE (poziom podstawowy)

Import **oficjalnych** zadań maturalnych (treść na stronie, bez linków dla ucznia).

- **18 arkuszy** z pełną treścią online: lata **2015–2025** (maj, próbne, przykładowe) + **maj 2024** z gotowymi rozwiązaniami w kodzie
- **~560 zadań** w Supabase po pierwszym imporcie
- Lata **2007–2014**: na źródłach tylko PDF - pomijane w automacie

```bash
# 1) Treść wszystkich arkuszy (szybko)
npm run seed:cke-matura -- --no-gemini

# 2) Rozwiązania Gemini (wznawialne; limit API ~20/dzień na free tier)
npm run seed:cke-matura -- --fill-solutions
npm run seed:cke-matura -- --fill-solutions --only=m25-maj,m23-maj

# Podmiana arkusza
npm run seed:cke-matura -- --only=m23-maj --replace --fill-solutions
```

Cache: `data/cke-matura-cache/` - po przerwaniu importu wznów `--fill-solutions`.

Rysunki z arkusza (zadania z wykresem / diagramem):

```bash
npm run seed:cke-matura -- --fix-images
```

Pobiera ilustracje do `public/cke-matura/` i aktualizuje treść w Supabase.

## `npm run seed:cke`

3 przykładowe zadania matury (ręczna tablica JSON).

## `npm run seed:trening-tasks` - arena treningowa (tasks + materials)

Masowy import zadań wielokrotnego wyboru do tabeli **`tasks`** oraz materiałów teoretycznych do **`materials`** (~5000 zadań, ~25 materiałów).

```bash
npm run seed:trening-tasks
npm run seed:trening-tasks -- --count=3000
npm run seed:trening-tasks -- --dry-run
npm run seed:trening-tasks -- --materials-only
```

**Wymagania:** `.env.local` z `NEXT_PUBLIC_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY`. Zapis do `tasks`/`materials` jest zablokowany dla `anon`/`authenticated` (RLS z `production_hardening`), więc seed musi iść kluczem service role.

Ponowne uruchomienie **pomija duplikaty** (hash treści). Pełny import ~1–3 min.

## `npm run repair:formatting` - naprawa formatowania LaTeX

Wykrywa i naprawia typowe uszkodzenia treści matematycznych: `\times` / `\frac` /
`\theta` zamienione na znaki sterujące przez parser JSON (efekt: `5imes3`),
nadmiarowe lub brakujące `$` oraz surowy LaTeX poza `$...$`.

```bash
# Podgląd zmian (cache + baza, jeśli jest .env.local) - nic nie zapisuje
npm run repair:formatting

# Tylko pliki cache
npm run repair:formatting -- --cache-only

# Zapis poprawek do cache i Supabase (tasks + materials)
npm run repair:formatting -- --apply
```

Renderowanie (`components/trening/MathText.tsx`, `TheoryMarkdown`) i tak naprawia
te artefakty w locie przez `lib/math/normalize-math-text.ts`, więc skrypt służy
do porządkowania danych w bazie i cache.

## `npm run repair:content` - jakość treści zadań

Audyt i naprawa: dokładne duplikaty zadań, opcje-artefakty (`NaN`, `undefined`), niewidoczne znaki (ZWSP/ZWNJ/BOM) oraz encje HTML w arkuszach CKE.

```bash
# Podgląd zmian - nic nie zapisuje
npm run repair:content

# Zapis (wymaga SUPABASE_SERVICE_ROLE_KEY)
npm run repair:content -- --apply

# Tylko wybrane obszary
npm run repair:content -- --only=duplicates
npm run repair:content -- --only=options,invisible,entities
```

Skrypt zostawia jeden rekord z każdej grupy duplikatów (najmniej niewidocznych znaków), dopełnia opcje dystraktorami, gdy trafi na `NaN`, i dekoduje encje typu `&frasl;` / `&fnof;`.
