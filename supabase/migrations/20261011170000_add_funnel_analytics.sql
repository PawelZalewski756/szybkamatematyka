alter table public.page_views
  add column if not exists source text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.page_views'::regclass
      and conname = 'page_views_source_check'
  ) then
    alter table public.page_views
      add constraint page_views_source_check
      check (source is null or source ~ '^[a-z0-9_-]{1,64}$');
  end if;
end;
$$;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
  event_name text not null check (
    event_name in ('session_start', 'signup_completed', 'first_task_solved')
  ),
  page_path text not null check (
    length(page_path) between 1 and 200
    and left(page_path, 1) = '/'
    and left(page_path, 2) <> '//'
  ),
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_name_time_idx
  on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_visitor_time_idx
  on public.analytics_events (visitor_hash, occurred_at desc);
create unique index if not exists analytics_events_one_conversion_per_visitor_idx
  on public.analytics_events (visitor_hash, event_name)
  where event_name in ('signup_completed', 'first_task_solved');

alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from public, anon, authenticated;
grant all on table public.analytics_events to service_role;

create or replace function public.record_page_view_with_source(
  p_visitor_hash text,
  p_page_path text,
  p_source text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(p_visitor_hash !~ '^[0-9a-f]{64}$', true)
    or p_page_path is null
    or length(p_page_path) not between 1 and 200
    or left(p_page_path, 1) <> '/'
    or left(p_page_path, 2) = '//'
    or (p_source is not null and p_source !~ '^[a-z0-9_-]{1,64}$')
  then
    raise exception 'Invalid page-view data';
  end if;

  insert into public.page_views (visitor_hash, page_path, source)
  values (p_visitor_hash, p_page_path, p_source);
end;
$$;

create or replace function public.record_analytics_event(
  p_visitor_hash text,
  p_event_name text,
  p_page_path text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(p_visitor_hash !~ '^[0-9a-f]{64}$', true)
    or p_event_name is null
    or p_event_name not in ('session_start', 'signup_completed', 'first_task_solved')
    or p_page_path is null
    or length(p_page_path) not between 1 and 200
    or left(p_page_path, 1) <> '/'
    or left(p_page_path, 2) = '//'
  then
    raise exception 'Invalid analytics event';
  end if;

  insert into public.analytics_events (visitor_hash, event_name, page_path)
  values (p_visitor_hash, p_event_name, p_page_path)
  on conflict do nothing;
end;
$$;

create or replace function public.get_funnel_stats(p_since timestamptz default null)
returns table (
  total_views bigint,
  unique_visitors bigint,
  sessions bigint,
  returning_visitors bigint,
  registrations bigint,
  first_task_solvers bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with filtered_sessions as (
    select visitor_hash, count(*) as session_count
    from public.analytics_events
    where event_name = 'session_start'
      and (p_since is null or occurred_at >= p_since)
    group by visitor_hash
  )
  select
    (select count(*) from public.page_views
      where p_since is null or visited_at >= p_since),
    (select count(distinct visitor_hash) from public.page_views
      where p_since is null or visited_at >= p_since),
    coalesce((select sum(session_count) from filtered_sessions), 0),
    (select count(*)
      from filtered_sessions sessions
      where case
        when p_since is null then sessions.session_count > 1
        else exists (
          select 1
          from public.analytics_events earlier
          where earlier.visitor_hash = sessions.visitor_hash
            and earlier.event_name = 'session_start'
            and earlier.occurred_at < p_since
        )
      end),
    (select count(distinct visitor_hash) from public.analytics_events
      where event_name = 'signup_completed'
        and (p_since is null or occurred_at >= p_since)),
    (select count(distinct visitor_hash) from public.analytics_events
      where event_name = 'first_task_solved'
        and (p_since is null or occurred_at >= p_since));
$$;

create or replace function public.get_traffic_source_stats(p_since timestamptz default null)
returns table (source text, views bigint, unique_visitors bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    page_views.source,
    count(*)::bigint,
    count(distinct visitor_hash)::bigint
  from public.page_views
  where page_views.source is not null
    and (p_since is null or visited_at >= p_since)
  group by page_views.source
  order by count(*) desc
  limit 10;
$$;

create or replace function public.get_source_funnel_stats(p_since timestamptz default null)
returns table (
  source text,
  unique_visitors bigint,
  registrations bigint,
  first_task_solvers bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with attributed_visitors as (
    select distinct visitor_hash, source
    from public.page_views
    where source is not null
      and (p_since is null or visited_at >= p_since)
  )
  select
    attributed_visitors.source,
    count(distinct attributed_visitors.visitor_hash)::bigint,
    count(distinct events.visitor_hash) filter (
      where events.event_name = 'signup_completed'
    )::bigint,
    count(distinct events.visitor_hash) filter (
      where events.event_name = 'first_task_solved'
    )::bigint
  from attributed_visitors
  left join public.analytics_events events
    on events.visitor_hash = attributed_visitors.visitor_hash
    and events.event_name in ('signup_completed', 'first_task_solved')
    and (p_since is null or events.occurred_at >= p_since)
  group by attributed_visitors.source
  order by count(distinct attributed_visitors.visitor_hash) desc
  limit 10;
$$;

revoke all on function public.record_page_view_with_source(text, text, text) from public, anon, authenticated;
revoke all on function public.record_analytics_event(text, text, text) from public, anon, authenticated;
revoke all on function public.get_funnel_stats(timestamptz) from public, anon, authenticated;
revoke all on function public.get_traffic_source_stats(timestamptz) from public, anon, authenticated;
revoke all on function public.get_source_funnel_stats(timestamptz) from public, anon, authenticated;
grant execute on function public.record_page_view_with_source(text, text, text) to service_role;
grant execute on function public.record_analytics_event(text, text, text) to service_role;
grant execute on function public.get_funnel_stats(timestamptz) to service_role;
grant execute on function public.get_traffic_source_stats(timestamptz) to service_role;
grant execute on function public.get_source_funnel_stats(timestamptz) to service_role;
