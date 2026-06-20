# Konfiguracja bazy (Supabase)

Błąd **„Could not find the table public.zadania”** oznacza, że migracja nie została uruchomiona w Twoim projekcie Supabase.

## Kroki (5 minut)

### Krok 1 — tabele (tylko raz)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **SQL Editor** → **New query**
2. Wklej cały plik `migrations/init_baza_zadan.sql` → **Run**

Jeśli widzisz **„policy … already exists”** — **krok 1 masz już zrobiony**. Nie uruchamiaj go ponownie. Przejdź od razu do kroku 2 (`krok2_tylko_source_id.sql`).

### Krok 2 — kolumna source_id

Wklej i uruchom plik `migrations/krok2_tylko_source_id.sql` → **Run**
5. W projekcie Next.js sprawdź `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   Klucze bierz z **Project Settings → API** (ten sam projekt!).
6. Zrestartuj `npm run dev` i wejdź na `/admin`, aby dodać pierwszy arkusz.

## Seed testowy (3 zadania)

Po migracji SQL:

```bash
npm run seed:cke
```

Skrypt `scripts/seedCKE.js` tworzy arkusz **Matura Maj 2024** i wgrywa 3 przykładowe zadania.

## Auto-import (~1000 zadań + Gemini)

```bash
npm run seed:auto -- --limit=10   # test
npm run seed:auto                 # pełny import (długo!)
```

Wymaga kolumny `source_id` — jeśli błąd 42703, uruchom **cały** plik `migrations/add_zadania_source_id.sql` (najpierw `ALTER`, potem indeks).

## Profile i rankingi

1. Uruchom `profiles.sql` (tabela `profiles`, RLS, trigger przy rejestracji).
2. Uruchom `migrations/init_profiles_avatars.sql` (kolumna `avatar_url`, bucket Storage **`avatary`**).

Bez kroku 2 upload awatara w profilu zwróci błąd kolumny lub Storage.

### Bucket awatarów „avatary”

Aplikacja zapisuje pliki do bucketa o id **`avatary`**.

**Krok po kroku w Supabase:**

1. Otwórz [supabase.com/dashboard](https://supabase.com/dashboard) → wybierz **ten sam projekt** co w `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`).
2. **SQL Editor** → **New query**.
3. Wklej całą zawartość pliku `migrations/init_profiles_avatars.sql` (profil + bucket) **albo** tylko `setup_avatary_bucket.sql` (sam bucket i polityki Storage).
4. Kliknij **Run**. Komunikat sukcesu lub brak błędu = OK; skrypt jest idempotentny (można uruchomić ponownie).
5. **Storage** → **Buckets** — na liście musi być bucket **`avatary`**, oznaczony jako **Public**.
6. Zrestartuj `npm run dev` i spróbuj ponownie wgrać awatar na `/profil`.

Jeśli `INSERT` do `storage.buckets` zwraca błąd uprawnień, utwórz bucket ręcznie: **Storage** → **New bucket** → nazwa **`avatary`**, **Public bucket** włączone, limit 2 MB, typy PNG/JPG — potem uruchom `setup_avatary_bucket.sql` (polityki Storage).

## Arena treningowa (`tasks`, `materials`)

Po migracjach `init_tasks.sql` i `init_materials.sql` uruchom w SQL Editor:

```
migrations/add_tasks_materials_insert.sql
```

Dzięki temu skrypt `npm run seed:trening-tasks` może wstawiać zadania i materiały kluczem **anon** (bez `SUPABASE_SERVICE_ROLE_KEY`). Polityki INSERT/UPDATE/DELETE dla `tasks` i `materials` są otwarte dla anon i authenticated — odpowiednie tylko na etapie seedu; na produkcji rozważ polityki admin-only.

```bash
npm run seed:trening-tasks              # ~5000 zadań + materiały teoretyczne
npm run seed:trening-tasks -- --dry-run # podgląd bez zapisu
npm run seed:trening-tasks -- --materials-only
```

Ponowne uruchomienie deduplikuje treść (SHA hash) — nie tworzy duplikatów. Liczniki w bazie: `npx tsx scripts/countDb.ts`.

## Tabele

- `arkusze` — matura / Egzamin 8-klasisty, miesiąc, rok
- `zadania` — treść + rozwiązanie krok po kroku
- `tasks` — arena treningowa (egzamin, dział, temat, XP)
- `materials` — teoria przy tematach treningu
- `profiles` — nick, XP, poziom, streak, `avatar_url`
