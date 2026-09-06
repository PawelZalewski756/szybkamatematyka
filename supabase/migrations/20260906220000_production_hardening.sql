-- Final production hardening.
--
-- Run this file only after the base tables and feature migrations have been
-- applied. Unlike the older hardening files, this migration re-asserts the
-- complete final state, so running it again repairs a database that was
-- hardened too early.
--
-- Content tables stay publicly readable. Every write to content tables is
-- restricted to an authenticated admin. Player-owned tables keep own-row RLS.
-- duel_rooms intentionally remains public for anonymous casual duels.

do $$
declare
  required_table text;
begin
  foreach required_table in array
    array['profiles', 'arkusze', 'zadania', 'tasks', 'materials', 'solved_tasks']
  loop
    if to_regclass(format('public.%I', required_table)) is null then
      raise exception
        'Missing required table public.%. Run the base migrations before production_hardening.',
        required_table;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Admin whitelist used by content write policies.
-- ---------------------------------------------------------------------------

create table if not exists public.admin_emails (
  email text primary key
);

alter table public.admin_emails enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Remove every existing policy from public content tables before creating the
-- final set. This also removes policies added by the temporary seed migration.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array
    array['arkusze', 'zadania', 'tasks', 'materials']
  loop
    execute format('alter table public.%I enable row level security', table_name);

    for policy_name in
      select p.policyname
      from pg_policies p
      where p.schemaname = 'public'
        and p.tablename = table_name
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        policy_name,
        table_name
      );
    end loop;

    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      table_name || '_select_public',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      table_name || '_insert_admin',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name || '_update_admin',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      table_name || '_delete_admin',
      table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles: preserve own-row editing but make billing and quota fields
-- service-role-only through a database trigger.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists subscription_status text not null default 'free';
alter table public.profiles
  add column if not exists subscription_plan text;
alter table public.profiles
  add column if not exists subscription_current_period_end timestamptz;
alter table public.profiles
  add column if not exists subscription_cancel_at_period_end boolean not null default false;
alter table public.profiles
  add column if not exists stripe_customer_id text;
alter table public.profiles
  add column if not exists stripe_subscription_id text;
alter table public.profiles
  add column if not exists ai_assist_period text;
alter table public.profiles
  add column if not exists ai_assist_count integer not null default 0;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.protect_server_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in (
    'service_role',
    'supabase_admin',
    'postgres',
    'supabase_auth_admin'
  ) then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.subscription_status               := old.subscription_status;
    new.subscription_plan                 := old.subscription_plan;
    new.subscription_current_period_end   := old.subscription_current_period_end;
    new.subscription_cancel_at_period_end := old.subscription_cancel_at_period_end;
    new.stripe_customer_id                := old.stripe_customer_id;
    new.stripe_subscription_id            := old.stripe_subscription_id;
    new.ai_assist_period                  := old.ai_assist_period;
    new.ai_assist_count                   := old.ai_assist_count;
  elsif tg_op = 'INSERT' then
    new.subscription_status               := 'free';
    new.subscription_plan                 := null;
    new.subscription_current_period_end   := null;
    new.subscription_cancel_at_period_end := false;
    new.stripe_customer_id                := null;
    new.stripe_subscription_id            := null;
    new.ai_assist_period                  := null;
    new.ai_assist_count                   := 0;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_server_profile_columns_trg on public.profiles;
create trigger protect_server_profile_columns_trg
  before insert or update on public.profiles
  for each row execute function public.protect_server_profile_columns();

-- ---------------------------------------------------------------------------
-- Player-owned tables: re-assert complete own-row policies if their feature
-- migrations were previously run before the tables existed.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.solved_tasks') is not null then
    execute 'alter table public.solved_tasks enable row level security';
    execute 'drop policy if exists "solved_tasks_select_own" on public.solved_tasks';
    execute 'drop policy if exists "solved_tasks_insert_own" on public.solved_tasks';
    execute $policy$
      create policy "solved_tasks_select_own"
        on public.solved_tasks for select to authenticated
        using (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "solved_tasks_insert_own"
        on public.solved_tasks for insert to authenticated
        with check (auth.uid() = user_id)
    $policy$;
  end if;

  if to_regclass('public.daily_challenges') is not null then
    execute 'alter table public.daily_challenges enable row level security';
    execute 'drop policy if exists "daily_challenges_select_own" on public.daily_challenges';
    execute 'drop policy if exists "daily_challenges_insert_own" on public.daily_challenges';
    execute 'drop policy if exists "daily_challenges_update_own" on public.daily_challenges';
    execute 'drop policy if exists "daily_challenges_delete_own" on public.daily_challenges';
    execute $policy$
      create policy "daily_challenges_select_own"
        on public.daily_challenges for select to authenticated
        using (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "daily_challenges_insert_own"
        on public.daily_challenges for insert to authenticated
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "daily_challenges_update_own"
        on public.daily_challenges for update to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "daily_challenges_delete_own"
        on public.daily_challenges for delete to authenticated
        using (auth.uid() = user_id)
    $policy$;
  end if;

  if to_regclass('public.review_schedule') is not null then
    execute 'alter table public.review_schedule enable row level security';
    execute 'drop policy if exists "review_schedule_select_own" on public.review_schedule';
    execute 'drop policy if exists "review_schedule_insert_own" on public.review_schedule';
    execute 'drop policy if exists "review_schedule_update_own" on public.review_schedule';
    execute 'drop policy if exists "review_schedule_delete_own" on public.review_schedule';
    execute $policy$
      create policy "review_schedule_select_own"
        on public.review_schedule for select to authenticated
        using (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "review_schedule_insert_own"
        on public.review_schedule for insert to authenticated
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "review_schedule_update_own"
        on public.review_schedule for update to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "review_schedule_delete_own"
        on public.review_schedule for delete to authenticated
        using (auth.uid() = user_id)
    $policy$;
  end if;

  if to_regclass('public.user_achievements') is not null then
    execute 'alter table public.user_achievements enable row level security';
    execute 'drop policy if exists "user_achievements_select_own" on public.user_achievements';
    execute 'drop policy if exists "user_achievements_insert_own" on public.user_achievements';
    execute 'drop policy if exists "user_achievements_update_own" on public.user_achievements';
    execute 'drop policy if exists "user_achievements_delete_own" on public.user_achievements';
    execute $policy$
      create policy "user_achievements_select_own"
        on public.user_achievements for select to authenticated
        using (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "user_achievements_insert_own"
        on public.user_achievements for insert to authenticated
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "user_achievements_update_own"
        on public.user_achievements for update to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "user_achievements_delete_own"
        on public.user_achievements for delete to authenticated
        using (auth.uid() = user_id)
    $policy$;
  end if;

  if to_regclass('public.duel_results') is not null then
    execute 'alter table public.duel_results enable row level security';
    execute 'drop policy if exists "duel_results_select_own" on public.duel_results';
    execute 'drop policy if exists "duel_results_insert_own" on public.duel_results';
    execute $policy$
      create policy "duel_results_select_own"
        on public.duel_results for select to authenticated
        using (auth.uid() = user_id)
    $policy$;
    execute $policy$
      create policy "duel_results_insert_own"
        on public.duel_results for insert to authenticated
        with check (auth.uid() = user_id)
    $policy$;
  end if;
end $$;

-- Anonymous duels are deliberately public. Recreate the structure-lock trigger
-- here as well, so the final migration is sufficient even when the older audit
-- migration was skipped.
create or replace function public.duel_rooms_lock_structure()
returns trigger
language plpgsql
as $$
begin
  new.code           := old.code;
  new.slug           := old.slug;
  new.path           := old.path;
  new.seed           := old.seed;
  new.question_count := old.question_count;
  new.host_name      := old.host_name;
  new.created_at     := old.created_at;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.duel_rooms') is not null then
    execute 'alter table public.duel_rooms enable row level security';
    execute 'drop policy if exists "duel_rooms_select_all" on public.duel_rooms';
    execute 'drop policy if exists "duel_rooms_insert_all" on public.duel_rooms';
    execute 'drop policy if exists "duel_rooms_update_all" on public.duel_rooms';
    execute $policy$
      create policy "duel_rooms_select_all"
        on public.duel_rooms for select to anon, authenticated
        using (true)
    $policy$;
    execute $policy$
      create policy "duel_rooms_insert_all"
        on public.duel_rooms for insert to anon, authenticated
        with check (true)
    $policy$;
    execute $policy$
      create policy "duel_rooms_update_all"
        on public.duel_rooms for update to anon, authenticated
        using (true)
        with check (true)
    $policy$;
    execute 'drop trigger if exists duel_rooms_lock_structure_trg on public.duel_rooms';
    execute $trigger$
      create trigger duel_rooms_lock_structure_trg
        before update on public.duel_rooms
        for each row execute function public.duel_rooms_lock_structure()
    $trigger$;
  end if;
end $$;
