-- Hide billing/quota columns from public profile reads and make free-tier
-- assistant reservations atomic.

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
  private_profile_columns constant text[] := array[
    'subscription_status',
    'subscription_plan',
    'subscription_current_period_end',
    'subscription_cancel_at_period_end',
    'stripe_customer_id',
    'stripe_subscription_id',
    'ai_assist_period',
    'ai_assist_count'
  ];
begin
  revoke select on table public.profiles from anon, authenticated;

  foreach profile_column in array public_profile_columns
  loop
    if exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = 'profiles'
        and c.column_name = profile_column
    ) then
      execute format(
        'grant select (%I) on table public.profiles to anon, authenticated',
        profile_column
      );
    end if;
  end loop;

  foreach profile_column in array private_profile_columns
  loop
    if exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = 'profiles'
        and c.column_name = profile_column
    ) then
      execute format(
          'revoke select (%I) on table public.profiles from anon, authenticated',
        profile_column
      );
        execute format(
          'revoke insert (%I) on table public.profiles from anon, authenticated',
          profile_column
        );
        execute format(
          'revoke update (%I) on table public.profiles from anon, authenticated',
          profile_column
        );
    end if;
  end loop;
end $$;

create or replace function public.get_my_subscription()
returns table (
  subscription_status text,
  subscription_plan text,
  subscription_current_period_end timestamptz,
  subscription_cancel_at_period_end boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.subscription_status,
    p.subscription_plan,
    p.subscription_current_period_end,
    p.subscription_cancel_at_period_end
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_subscription() from public;
grant execute on function public.get_my_subscription() to authenticated;

create or replace function public.consume_ai_assist_quota(
  p_user_id uuid,
  p_period text,
  p_limit integer
)
returns table (
  allowed boolean,
  period text,
  used integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.profiles%rowtype;
  current_used integer;
begin
  if p_user_id is null
     or p_period !~ '^[0-9]{4}-[0-9]{2}$'
     or p_limit < 1 then
    raise exception 'Invalid assistant quota parameters';
  end if;

  update public.profiles
  set
    ai_assist_period = p_period,
    ai_assist_count = case
      when ai_assist_period = p_period
        then coalesce(ai_assist_count, 0) + 1
      else 1
    end
  where id = p_user_id
    and (
      ai_assist_period is distinct from p_period
      or coalesce(ai_assist_count, 0) < p_limit
    )
  returning * into updated_row;

  if found then
    return query
      select true, updated_row.ai_assist_period, updated_row.ai_assist_count;
    return;
  end if;

  select case
    when ai_assist_period = p_period then coalesce(ai_assist_count, 0)
    else 0
  end
  into current_used
  from public.profiles
  where id = p_user_id;

  return query select false, p_period, coalesce(current_used, 0);
end;
$$;

revoke all on function public.consume_ai_assist_quota(uuid, text, integer) from public;
grant execute on function public.consume_ai_assist_quota(uuid, text, integer) to service_role;

-- Older hardening migrations installed a narrower duplicate trigger. Keep one
-- authoritative protection function so future schema changes cannot diverge.
drop trigger if exists protect_subscription_columns_trg on public.profiles;
drop function if exists public.protect_subscription_columns();
