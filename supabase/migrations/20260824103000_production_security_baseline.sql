-- Production security baseline:
--  * publiczne treści są read-only dla anon/authenticated,
--  * pełny profil jest prywatny (własny wiersz lub admin),
--  * ranking czyta wyłącznie bezpieczny widok,
--  * pola systemowe profilu można zmieniać tylko przez walidowane RPC,
--  * nagrody i wyniki pojedynków są idempotentne.

-- ---------------------------------------------------------------------------
-- 1. Treści CMS: usuń wszystkie znane otwarte polityki zapisu.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  p record;
  tables text[] := array['arkusze', 'zadania', 'tasks', 'materials'];
begin
  foreach t in array tables loop
    if to_regclass(format('public.%I', t)) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);

    for p in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = t
        and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
    loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;

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

-- ---------------------------------------------------------------------------
-- 2. Pola profilu potrzebne przez bezpieczne funkcje.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists minigry_xp bigint not null default 0,
  add column if not exists hearts integer not null default 5,
  add column if not exists ai_assist_period text,
  add column if not exists ai_assist_count integer not null default 0,
  add column if not exists duel_played integer not null default 0,
  add column if not exists duel_wins integer not null default 0,
  add column if not exists duel_losses integer not null default 0,
  add column if not exists duel_draws integer not null default 0,
  add column if not exists duel_rating integer not null default 0;

drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Widok rankingu nie ujawnia pól prywatnych ani billingowych.
drop view if exists public.public_leaderboard_profiles;
create view public.public_leaderboard_profiles
with (security_barrier = true)
as
select
  id, nick, nickname, xp, minigry_xp, level, avatar_url,
  duel_rating, duel_wins, duel_played
from public.profiles;

revoke all on public.public_leaderboard_profiles from public;
grant select on public.public_leaderboard_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Idempotentny rejestr nagród.
-- ---------------------------------------------------------------------------
create table if not exists public.profile_reward_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('arena', 'minigame', 'daily', 'duel')),
  event_id text not null,
  xp_awarded integer not null check (xp_awarded between 0 and 320),
  created_at timestamptz not null default now(),
  unique (user_id, event_type, event_id)
);

alter table public.profile_reward_events enable row level security;
drop policy if exists "profile_reward_events_select_own" on public.profile_reward_events;
create policy "profile_reward_events_select_own"
  on public.profile_reward_events for select
  to authenticated using (auth.uid() = user_id);
-- Brak INSERT/UPDATE/DELETE dla klienta. Zapisuje tylko funkcja security definer.

create or replace function public.apply_profile_reward(
  p_event_type text,
  p_event_id text,
  p_value integer
)
returns table (
  id uuid,
  nick text,
  nickname text,
  xp bigint,
  minigry_xp bigint,
  level integer,
  streak integer,
  last_played_date date,
  avatar_url text,
  last_nick_update timestamptz,
  school_class text,
  subscription_status text,
  subscription_plan text,
  subscription_current_period_end timestamptz,
  subscription_cancel_at_period_end boolean,
  xp_earned integer,
  duplicate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_xp integer;
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_daily_total integer;
  v_inserted boolean;
  v_row_count integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_event_type not in ('arena', 'minigame', 'daily', 'duel') then
    raise exception 'unsupported reward event';
  end if;
  if p_event_id is null or length(trim(p_event_id)) not between 1 and 160 then
    raise exception 'invalid event id';
  end if;

  v_xp := case p_event_type
    when 'arena' then least(greatest(coalesce(p_value, 0), 0), 25)
    when 'daily' then least(greatest(coalesce(p_value, 0), 0), 155)
    else case
      when coalesce(p_value, 0) <= 0 then 0
      else least(greatest(floor(sqrt(p_value::numeric) * 10)::integer, 5), 320)
    end
  end;

  select coalesce(sum(e.xp_awarded), 0)::integer into v_daily_total
  from public.profile_reward_events e
  where e.user_id = v_user
    and (e.created_at at time zone 'Europe/Warsaw')::date = v_today;

  if v_daily_total + v_xp > 1500 then
    raise exception 'daily reward limit exceeded';
  end if;

  insert into public.profile_reward_events(user_id, event_type, event_id, xp_awarded)
  values (v_user, p_event_type, trim(p_event_id), v_xp)
  on conflict (user_id, event_type, event_id) do nothing;
  get diagnostics v_row_count = row_count;
  v_inserted := v_row_count > 0;

  if v_inserted then
    update public.profiles p
    set
      xp = p.xp + v_xp,
      level = floor((p.xp + v_xp) / 500.0)::integer + 1,
      minigry_xp = p.minigry_xp +
        case when p_event_type = 'minigame' then v_xp else 0 end,
      streak = case
        when p_event_type not in ('minigame', 'daily', 'duel') then p.streak
        when p.last_played_date = v_today then greatest(1, p.streak)
        when p.last_played_date = v_today - 1 then greatest(1, p.streak) + 1
        else 1
      end,
      last_played_date = case
        when p_event_type in ('minigame', 'daily', 'duel') then v_today
        else p.last_played_date
      end
    where p.id = v_user;
  end if;

  return query
  select
    p.id, p.nick, p.nickname, p.xp, p.minigry_xp, p.level, p.streak,
    p.last_played_date, p.avatar_url, p.last_nick_update, p.school_class,
    p.subscription_status, p.subscription_plan,
    p.subscription_current_period_end, p.subscription_cancel_at_period_end,
    case when v_inserted then v_xp else 0 end,
    not v_inserted
  from public.profiles p
  where p.id = v_user;
end;
$$;

revoke all on function public.apply_profile_reward(text, text, integer) from public;
grant execute on function public.apply_profile_reward(text, text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Atomowy zapis wyniku pojedynku.
-- ---------------------------------------------------------------------------
alter table public.duel_results
  add column if not exists client_event_id text;
create unique index if not exists duel_results_user_event_uidx
  on public.duel_results(user_id, client_event_id)
  where client_event_id is not null;

create or replace function public.record_duel_result(
  p_event_id text,
  p_outcome text,
  p_mode text,
  p_slug text,
  p_score integer,
  p_opponent_score integer,
  p_correct integer,
  p_total integer,
  p_duration_ms integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_delta integer;
  v_inserted boolean;
  v_row_count integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_outcome not in ('win', 'loss', 'draw') then raise exception 'invalid outcome'; end if;
  if p_event_id is null or length(trim(p_event_id)) not between 1 and 160 then
    raise exception 'invalid event id';
  end if;

  v_delta := case p_outcome when 'win' then 20 when 'loss' then -12 else 4 end;

  insert into public.duel_results(
    user_id, client_event_id, outcome, mode, slug, score, opponent_score,
    correct, total, duration_ms, rating_delta
  ) values (
    v_user, trim(p_event_id), p_outcome, left(p_mode, 40), left(p_slug, 120),
    greatest(p_score, 0), greatest(p_opponent_score, 0),
    greatest(p_correct, 0), greatest(p_total, 0),
    greatest(p_duration_ms, 0), v_delta
  )
  on conflict (user_id, client_event_id) where client_event_id is not null do nothing;
  get diagnostics v_row_count = row_count;
  v_inserted := v_row_count > 0;

  if v_inserted then
    update public.profiles
    set
      duel_played = duel_played + 1,
      duel_wins = duel_wins + case when p_outcome = 'win' then 1 else 0 end,
      duel_losses = duel_losses + case when p_outcome = 'loss' then 1 else 0 end,
      duel_draws = duel_draws + case when p_outcome = 'draw' then 1 else 0 end,
      duel_rating = greatest(0, duel_rating + v_delta)
    where profiles.id = v_user;
  end if;

  -- `true` oznacza, że wynik jest zapisany; duplikat jest również sukcesem
  -- idempotentnym, tylko bez ponownej zmiany statystyk.
  return true;
end;
$$;

revoke all on function public.record_duel_result(text, text, text, text, integer, integer, integer, integer, integer) from public;
grant execute on function public.record_duel_result(text, text, text, text, integer, integer, integer, integer, integer) to authenticated;

-- Atomowe zużycie miesięcznego limitu AI. Wyłącznie backend service_role.
create or replace function public.consume_ai_assist_quota(
  p_user_id uuid,
  p_period text,
  p_limit integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if current_user <> 'service_role' then
    raise exception 'service role required';
  end if;
  if p_period !~ '^[0-9]{4}-[0-9]{2}$' or p_limit < 1 then
    raise exception 'invalid quota arguments';
  end if;

  update public.profiles p
  set
    ai_assist_period = p_period,
    ai_assist_count = case
      when p.ai_assist_period = p_period then p.ai_assist_count + 1
      else 1
    end
  where p.id = p_user_id
    and (
      p.ai_assist_period is distinct from p_period
      or p.ai_assist_count < p_limit
    )
  returning p.ai_assist_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.consume_ai_assist_quota(uuid, text, integer) from public;
grant execute on function public.consume_ai_assist_quota(uuid, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Klient nie może bezpośrednio nadpisywać pól systemowych.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_system_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('service_role', 'supabase_admin', 'postgres', 'supabase_auth_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.xp := old.xp;
    new.level := old.level;
    new.minigry_xp := old.minigry_xp;
    new.streak := old.streak;
    new.last_played_date := old.last_played_date;
    new.hearts := old.hearts;
    new.ai_assist_period := old.ai_assist_period;
    new.ai_assist_count := old.ai_assist_count;
    new.duel_played := old.duel_played;
    new.duel_wins := old.duel_wins;
    new.duel_losses := old.duel_losses;
    new.duel_draws := old.duel_draws;
    new.duel_rating := old.duel_rating;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_system_columns_trg on public.profiles;
create trigger protect_profile_system_columns_trg
  before update on public.profiles
  for each row execute function public.protect_profile_system_columns();

