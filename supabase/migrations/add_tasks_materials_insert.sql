-- PLIK WYŁĄCZONY - nie otwiera już zapisu do tabel.
--
-- Historycznie ta migracja nadawała rolom `anon` i `authenticated` pełne
-- INSERT/UPDATE/DELETE na public.tasks i public.materials. Ponieważ klucz
-- publiczny Supabase jest w bundle'u aplikacji, każdy mógł wtedy usunąć lub
-- podmienić całą bazę zadań. Dlatego plik jest celowo pusty (no-op).
--
-- Docelowy stan opisuje migracja 20260906220000_production_hardening.sql:
--   * SELECT dla anon/authenticated,
--   * INSERT/UPDATE/DELETE tylko dla zalogowanego administratora
--     (public.is_admin() + tabela public.admin_emails),
--   * skrypty seedujące i naprawcze używają SUPABASE_SERVICE_ROLE_KEY.
--
-- Lokalnie: użyj service_role albo dodaj swój e-mail do public.admin_emails
-- i zaloguj się w aplikacji.

select 1;
