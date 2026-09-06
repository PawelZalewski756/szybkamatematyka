-- Keep the Auth -> profiles trigger aligned with the current profile schema.
-- Older deployments inserted only `nickname`, while `profiles.nick` is
-- required. That caused Supabase Auth to return "Database error creating new
-- user" for every new registration.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_nick text;
  final_nick text;
begin
  meta_nick := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nick'), ''),
    nullif(trim(new.raw_user_meta_data->>'nickname'), '')
  );
  final_nick := coalesce(
    meta_nick,
    'gracz_' || substring(replace(new.id::text, '-', ''), 1, 8)
  );

  begin
    insert into public.profiles (
      id,
      nick,
      nickname,
      xp,
      level
    )
    values (new.id, final_nick, final_nick, 0, 1)
    on conflict (id) do update set
      nick = coalesce(nullif(trim(excluded.nick), ''), public.profiles.nick),
      nickname = coalesce(
        nullif(trim(excluded.nickname), ''),
        public.profiles.nickname
      );
  exception
    when unique_violation then
      -- A nick race must not roll back Auth user creation. Fall back to a
      -- deterministic nick based on the user's UUID.
      final_nick := 'gracz_' || substring(replace(new.id::text, '-', ''), 1, 12);
      insert into public.profiles (
        id,
        nick,
        nickname,
        xp,
        level
      )
      values (new.id, final_nick, final_nick, 0, 1)
      on conflict (id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
