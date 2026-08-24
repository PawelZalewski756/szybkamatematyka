-- Operations (Fala 5) + adaptive learning (Fala 6):
--  * współdzielone, atomowe limity żądań,
--  * idempotencja webhooków Stripe,
--  * eksport/usunięcie danych konta,
--  * opanowanie tematów,
--  * anonimowe dzienne liczniki produktowe (bez identyfikatora użytkownika).

-- ---------------------------------------------------------------------------
-- 1. Rate limits
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;
revoke all on public.rate_limit_buckets from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.rate_limit_buckets%rowtype;
  expired boolean;
  window_end timestamptz;
begin
  if current_user <> 'service_role' then
    raise exception 'service role required';
  end if;
  if p_key is null or length(p_key) < 3 or length(p_key) > 200 then
    raise exception 'invalid rate limit key';
  end if;
  if p_max < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  insert into public.rate_limit_buckets as t (bucket_key, count, window_start)
  values (p_key, 0, now())
  on conflict (bucket_key) do update
    set bucket_key = excluded.bucket_key;

  select * into rec
  from public.rate_limit_buckets
  where bucket_key = p_key
  for update;

  expired := rec.window_start <= now() - make_interval(secs => p_window_seconds);

  if expired then
    update public.rate_limit_buckets
      set count = 1, window_start = now()
      where bucket_key = p_key;
    return query select true, greatest(p_max - 1, 0), 0;
    return;
  end if;

  window_end := rec.window_start + make_interval(secs => p_window_seconds);

  if rec.count >= p_max then
    return query select
      false,
      0,
      greatest(1, ceil(extract(epoch from (window_end - now()))))::integer;
    return;
  end if;

  update public.rate_limit_buckets
    set count = rec.count + 1
    where bucket_key = p_key;

  return query select true, greatest(p_max - (rec.count + 1), 0), 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 2. Stripe webhook idempotency
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Topic mastery (not XP)
-- ---------------------------------------------------------------------------
create table if not exists public.topic_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null,
  category text not null,
  topic text not null,
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0),
  last_difficulty integer,
  last_result text,
  last_activity_at timestamptz not null default now(),
  streak_correct integer not null default 0,
  trend_delta real not null default 0,
  primary key (user_id, exam_type, category, topic)
);

create index if not exists topic_mastery_user_idx
  on public.topic_mastery (user_id, last_activity_at desc);

alter table public.topic_mastery enable row level security;

drop policy if exists "topic_mastery_select_own" on public.topic_mastery;
create policy "topic_mastery_select_own"
  on public.topic_mastery for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "topic_mastery_upsert_own" on public.topic_mastery;
-- Zapis tylko przez RPC — brak INSERT/UPDATE dla klienta.

create or replace function public.record_topic_attempt(
  p_exam_type text,
  p_category text,
  p_topic text,
  p_correct boolean,
  p_difficulty integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  prev public.topic_mastery%rowtype;
  old_acc real := 0;
  new_acc real := 0;
  next_attempts integer;
  next_correct integer;
  next_streak integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_exam_type is null or p_category is null or p_topic is null then
    raise exception 'invalid mastery key';
  end if;
  if length(p_exam_type) > 40 or length(p_category) > 80 or length(p_topic) > 80 then
    raise exception 'invalid mastery key length';
  end if;

  select * into prev
  from public.topic_mastery
  where user_id = uid
    and exam_type = p_exam_type
    and category = p_category
    and topic = p_topic
  for update;

  if found then
    old_acc := case when prev.attempts > 0 then prev.correct::real / prev.attempts else 0 end;
    next_attempts := prev.attempts + 1;
    next_correct := prev.correct + case when p_correct then 1 else 0 end;
    next_streak := case when p_correct then prev.streak_correct + 1 else 0 end;
    new_acc := next_correct::real / next_attempts;
    update public.topic_mastery
      set
        attempts = next_attempts,
        correct = next_correct,
        last_difficulty = coalesce(p_difficulty, prev.last_difficulty),
        last_result = case when p_correct then 'correct' else 'wrong' end,
        last_activity_at = now(),
        streak_correct = next_streak,
        trend_delta = new_acc - old_acc
      where user_id = uid
        and exam_type = p_exam_type
        and category = p_category
        and topic = p_topic;
  else
    insert into public.topic_mastery (
      user_id, exam_type, category, topic, attempts, correct,
      last_difficulty, last_result, last_activity_at, streak_correct, trend_delta
    ) values (
      uid, p_exam_type, p_category, p_topic, 1,
      case when p_correct then 1 else 0 end,
      p_difficulty,
      case when p_correct then 'correct' else 'wrong' end,
      now(),
      case when p_correct then 1 else 0 end,
      case when p_correct then 1 else 0 end
    );
  end if;
end;
$$;

revoke all on function public.record_topic_attempt(text, text, text, boolean, integer) from public;
grant execute on function public.record_topic_attempt(text, text, text, boolean, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Anonymous product metrics (daily counters, no user id)
-- ---------------------------------------------------------------------------
create table if not exists public.product_metrics_daily (
  day date not null default (timezone('Europe/Warsaw', now()))::date,
  event_name text not null,
  count integer not null default 0 check (count >= 0),
  primary key (day, event_name)
);

alter table public.product_metrics_daily enable row level security;
revoke all on public.product_metrics_daily from public, anon, authenticated;

create or replace function public.increment_product_metric(p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user <> 'service_role' then
    raise exception 'service role required';
  end if;
  if p_event is null or p_event !~ '^[a-z_]+$' or length(p_event) > 40 then
    raise exception 'invalid metric event';
  end if;

  insert into public.product_metrics_daily (day, event_name, count)
  values ((timezone('Europe/Warsaw', now()))::date, p_event, 1)
  on conflict (day, event_name) do update
    set count = public.product_metrics_daily.count + 1;
end;
$$;

revoke all on function public.increment_product_metric(text) from public;
grant execute on function public.increment_product_metric(text) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Account purge (GDPR) — public schema only. Auth user is deleted by API.
-- ---------------------------------------------------------------------------
create or replace function public.purge_own_user_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t text;
  tables text[] := array[
    'solved_tasks',
    'review_schedule',
    'duel_results',
    'user_achievements',
    'daily_challenges',
    'profile_reward_events',
    'topic_mastery'
  ];
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  foreach t in array tables loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    execute format('delete from public.%I where user_id = $1', t) using uid;
  end loop;

  if to_regclass('public.profiles') is not null then
    delete from public.profiles where id = uid;
  end if;
end;
$$;

revoke all on function public.purge_own_user_data() from public;
grant execute on function public.purge_own_user_data() to authenticated;
