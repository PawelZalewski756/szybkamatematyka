-- Bucket Storage „avatary” (idempotentny) - uruchom w Supabase → SQL Editor
-- Jeśli potrzebujesz też kolumny avatar_url, użyj migrations/init_profiles_avatars.sql

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
