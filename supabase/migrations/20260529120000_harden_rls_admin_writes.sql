-- Zaostrzenie RLS: zapis (insert/update/delete) tylko dla zalogowanych adminów.
-- Odczyt treści (arkusze, zadania, materials, tasks) pozostaje publiczny.
--
-- WAŻNE:
--  * Uruchom w Supabase SQL Editor PO migracjach init_* (potrzebne istniejące tabele).
--    Plik jest idempotentny i bezpieczny przy ponownym uruchomieniu, a brak danej
--    tabeli jest pomijany (to_regclass), więc kolejność nie wywoła błędu.
--  * NIE modyfikuje istniejących plików migracji - zastępuje tylko polityki zapisu.
--
-- Po uruchomieniu dodaj swoje konto do whitelisty:
--   insert into public.admin_emails (email) values ('twoj.admin@example.com')
--   on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Whitelist adminów + funkcja pomocnicza is_admin()
-- ---------------------------------------------------------------------------

create table if not exists public.admin_emails (
  email text primary key
);

-- Tabela widoczna tylko dla funkcji security definer / service_role.
alter table public.admin_emails enable row level security;

-- is_admin(): czy e-mail z JWT bieżącej sesji jest na whitelistcie.
-- security definer + ustawiony search_path, żeby ominąć RLS na admin_emails
-- i nie dać się podmienić obiektom z innych schematów.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails ae
    where lower(ae.email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Polityki zapisu: tabela po tabeli, tylko jeśli tabela istnieje.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  tables text[] := array['arkusze', 'zadania', 'tasks', 'materials'];
begin
  foreach t in array tables loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    -- Usuń stare, otwarte polityki zapisu (anon/authenticated with check (true)).
    execute format('drop policy if exists %I on public.%I', t || '_insert_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_all', t);

    -- Nowe, zaostrzone polityki: tylko authenticated + admin.
    execute format('drop policy if exists %I on public.%I', t || '_insert_admin', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_admin', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_admin', t);

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      t || '_insert_admin', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_update_admin', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      t || '_delete_admin', t
    );
  end loop;
end $$;

-- Odczyt pozostaje publiczny - polityki *_select_all z migracji init_* nie są ruszane.
