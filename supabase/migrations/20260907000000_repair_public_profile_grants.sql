-- Restore public profile column grants for deployments that added optional
-- columns through the older standalone SQL scripts. Without these grants,
-- PostgREST rejects the whole profile query, which makes rankings empty and
-- prevents avatar_url from being read even when the data exists.

do $$
declare
  profile_column text;
  public_profile_columns constant text[] := array[
    'id',
    'created_at',
    'nick',
    'nickname',
    'xp',
    'minigry_xp',
    'level',
    'streak',
    'last_played_date',
    'avatar_url',
    'last_nick_update',
    'hearts',
    'school_class',
    'duel_played',
    'duel_wins',
    'duel_losses',
    'duel_draws',
    'duel_rating'
  ];
begin
  if to_regclass('public.profiles') is null then
    raise notice 'pomijam granty profiles - tabela nie istnieje';
  else
    foreach profile_column in array public_profile_columns
    loop
      if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = profile_column
      ) then
        execute format(
          'grant select (%I) on table public.profiles to anon, authenticated',
          profile_column
        );
      end if;
    end loop;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'avatar_url'
    ) then
      execute
        'grant update (avatar_url) on table public.profiles to authenticated';
    end if;

    -- Pełne granty zapisu są w 20261027140000_repair_profile_write_grants.sql.
    -- Tutaj zostawiamy avatar_url dla kompatybilności ze starszymi deployami.
  end if;
end $$;
