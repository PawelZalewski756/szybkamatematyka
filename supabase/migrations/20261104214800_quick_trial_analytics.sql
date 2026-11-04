create table if not exists public.quick_trial_stats (
  id smallint primary key check (id = 1),
  unique_sessions bigint not null default 0,
  total_attempts bigint not null default 0,
  correct_attempts bigint not null default 0,
  incorrect_attempts bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.quick_trial_stats (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.quick_trial_sessions (
  session_id uuid primary key,
  created_at timestamptz not null default now()
);

create index if not exists quick_trial_sessions_created_at_idx
  on public.quick_trial_sessions (created_at);

alter table public.quick_trial_stats enable row level security;
alter table public.quick_trial_sessions enable row level security;

revoke all on table public.quick_trial_stats
  from public, anon, authenticated, service_role;
revoke all on table public.quick_trial_sessions
  from public, anon, authenticated, service_role;

create or replace function public.record_quick_trial_attempt(
  p_session_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_new_session_count bigint;
begin
  if p_session_id is null or p_is_correct is null then
    raise exception 'Session ID and answer result are required.';
  end if;

  delete from public.quick_trial_sessions
  where created_at < now() - interval '30 days';

  insert into public.quick_trial_sessions (session_id)
  values (p_session_id)
  on conflict (session_id) do nothing;
  get diagnostics v_new_session_count = row_count;

  update public.quick_trial_stats
  set unique_sessions = unique_sessions + v_new_session_count,
      total_attempts = total_attempts + 1,
      correct_attempts = correct_attempts + case when p_is_correct then 1 else 0 end,
      incorrect_attempts = incorrect_attempts + case when p_is_correct then 0 else 1 end,
      updated_at = now()
  where id = 1;
end;
$function$;

create or replace function public.get_quick_trial_stats()
returns table (
  unique_sessions bigint,
  total_attempts bigint,
  correct_attempts bigint,
  incorrect_attempts bigint
)
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  delete from public.quick_trial_sessions
  where created_at < now() - interval '30 days';

  return query
  select
    stats.unique_sessions,
    stats.total_attempts,
    stats.correct_attempts,
    stats.incorrect_attempts
  from public.quick_trial_stats as stats
  where stats.id = 1;
end;
$function$;

revoke all on function public.record_quick_trial_attempt(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.record_quick_trial_attempt(uuid, boolean)
  to service_role;

revoke all on function public.get_quick_trial_stats()
  from public, anon, authenticated;
grant execute on function public.get_quick_trial_stats()
  to service_role;

comment on table public.quick_trial_stats is
  'Lifetime aggregate counts for anonymous quick-trial answer attempts.';
comment on table public.quick_trial_sessions is
  'Random per-page session IDs kept for 30 days to deduplicate quick-trial sessions.';
