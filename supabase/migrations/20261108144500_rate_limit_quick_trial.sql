create table if not exists public.quick_trial_ip_rate_limits (
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  request_count integer not null check (request_count between 1 and 30),
  primary key (ip_hash, window_start)
);

create index if not exists quick_trial_ip_rate_limits_window_start_idx
  on public.quick_trial_ip_rate_limits (window_start);

alter table public.quick_trial_ip_rate_limits enable row level security;
revoke all on table public.quick_trial_ip_rate_limits
  from public, anon, authenticated, service_role;

drop function if exists public.record_quick_trial_attempt(uuid, boolean);

create or replace function public.record_quick_trial_attempt(
  p_session_id uuid,
  p_is_correct boolean,
  p_ip_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_new_session_count bigint;
  v_request_count integer;
  v_window_start timestamptz := date_trunc('minute', now());
begin
  if p_session_id is null or p_is_correct is null then
    raise exception 'Session ID and answer result are required.';
  end if;

  if p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'A valid client IP hash is required.';
  end if;

  delete from public.quick_trial_ip_rate_limits
  where window_start < v_window_start - interval '10 minutes';

  insert into public.quick_trial_ip_rate_limits as rate_limit (
    ip_hash,
    window_start,
    request_count
  )
  values (p_ip_hash, v_window_start, 1)
  on conflict (ip_hash, window_start) do update
  set request_count = rate_limit.request_count + 1
  where rate_limit.request_count < 30
  returning request_count into v_request_count;

  if v_request_count is null then
    return false;
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

  return true;
end;
$function$;

revoke all on function public.record_quick_trial_attempt(uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function public.record_quick_trial_attempt(uuid, boolean, text)
  to service_role;

comment on table public.quick_trial_ip_rate_limits is
  'Short-lived HMACs of client IPs used to rate-limit anonymous quick-trial analytics.';
