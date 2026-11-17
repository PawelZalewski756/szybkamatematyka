-- Development note (PL):
-- Ten plik odbiera anon/authenticated prawo czytania kolumny `zadania.rozwiazanie`.
-- Aplikacja czyta rozwiązania wyłącznie przez API z kluczem service_role
-- (/api/trening/cms-solution i /api/trening/arkusz-solutions).
--
-- NIE STOSUJ na produkcji bez wdrożenia kodu z tego samego brancha:
-- po odebraniu uprawnień stary kod dostałby błąd 42501 (permission denied).
--
-- Weryfikacja po wdrożeniu:
--   select grantee, privilege_type, column_name
--   from information_schema.column_privileges
--   where table_name = 'zadania' and grantee in ('anon','authenticated')
--   order by grantee, column_name;
--   -- `rozwiazanie` nie może wystąpić na liście.
--
--   curl "$SUPABASE_URL/rest/v1/zadania?select=rozwiazanie&limit=1" \
--     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--   -- oczekiwane: 42501 / permission denied dla kolumny rozwiazanie.

revoke select on table public.zadania from anon, authenticated;

-- Kolumny potrzebne do publicznego katalogu i widoku arkusza.
grant select (
  id,
  arkusz_id,
  numer_zadania,
  dzial,
  tresc,
  created_at
) on public.zadania to anon, authenticated;

-- Serwer (service_role) musi nadal widzieć całość.
grant select on table public.zadania to service_role;

-- RLS zostaje bez zmian: polityka `zadania_select_all` dalej ogranicza wiersze,
-- a kolumny pilnuje grant. To dwie niezależne warstwy.
