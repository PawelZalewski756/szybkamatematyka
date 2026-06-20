-- Profile: avatar_url + bucket Storage „avatary”
-- Uruchom w Supabase → SQL Editor (po profiles.sql)
-- Tylko kolumna (bez Storage): add_avatar_url_only.sql

alter table public.profiles add column if not exists avatar_url text;

-- ---------------------------------------------------------------------------
-- Storage: bucket „avatary” (publiczny odczyt, upload tylko własny folder)
-- Błędy poniżej nie cofają ALTER powyżej (każda instrukcja osobno w SQL Editor).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatary',
  'avatary',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/jpg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Stare polityki (historyczne nazwy bucketów)
drop policy if exists "avatary_public_read" on storage.objects;
drop policy if exists "avatary_insert_own" on storage.objects;
drop policy if exists "avatary_update_own" on storage.objects;
drop policy if exists "avatary_delete_own" on storage.objects;

drop policy if exists "awatary_public_read" on storage.objects;
drop policy if exists "awatary_insert_own" on storage.objects;
drop policy if exists "awatary_update_own" on storage.objects;
drop policy if exists "awatary_delete_own" on storage.objects;

create policy "avatary_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatary');

drop policy if exists "avatary_insert_own" on storage.objects;
create policy "avatary_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatary'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatary_update_own" on storage.objects;
create policy "avatary_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatary'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatary'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatary_delete_own" on storage.objects;
create policy "avatary_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatary'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create index if not exists profiles_xp_desc_idx on public.profiles (xp desc);
