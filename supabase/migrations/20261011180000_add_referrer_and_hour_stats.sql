alter table public.page_views
  add column if not exists referrer_domain text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.page_views'::regclass
      and conname = 'page_views_referrer_domain_check'
  ) then
    alter table public.page_views
      add constraint page_views_referrer_domain_check
      check (
        referrer_domain is null
        or (
          length(referrer_domain) between 1 and 253
          and referrer_domain !~ '^[0-9.]+$'
          and referrer_domain ~ '^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
        )
      );
  end if;
end;
$$;

drop function if exists public.record_page_view_with_source(text, text, text);

create function public.record_page_view_with_source(
  p_visitor_hash text,
  p_page_path text,
  p_source text default null,
  p_referrer_domain text default null
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
    or (
      p_referrer_domain is not null
      and (
        length(p_referrer_domain) not between 1 and 253
        or p_referrer_domain ~ '^[0-9.]+$'
        or p_referrer_domain !~ '^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
      )
    )
  then
    raise exception 'Invalid page-view data';
  end if;

  insert into public.page_views (
    visitor_hash,
    page_path,
    source,
    referrer_domain
  )
  values (
    p_visitor_hash,
    p_page_path,
    p_source,
    p_referrer_domain
  );
end;
$$;

create or replace function public.get_traffic_source_stats(p_since timestamptz default null)
returns table (source text, views bigint, unique_visitors bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    case
      when page_views.source is not null then 'utm:' || page_views.source
      when page_views.referrer_domain is not null then 'referrer:' || page_views.referrer_domain
      else 'direct'
    end,
    count(*)::bigint,
    count(distinct visitor_hash)::bigint
  from public.page_views
  where p_since is null or visited_at >= p_since
  group by 1
  order by count(*) desc
  limit 10;
$$;

create or replace function public.get_visit_hour_stats(p_since timestamptz default null)
returns table (local_hour integer, total_views bigint, unique_visitors bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    extract(hour from page_views.visited_at at time zone 'Europe/Warsaw')::integer,
    count(*)::bigint,
    count(distinct visitor_hash)::bigint
  from public.page_views
  where p_since is null or visited_at >= p_since
  group by 1
  order by 1;
$$;

revoke all on function public.record_page_view_with_source(text, text, text, text) from public, anon, authenticated;
revoke all on function public.get_traffic_source_stats(timestamptz) from public, anon, authenticated;
revoke all on function public.get_visit_hour_stats(timestamptz) from public, anon, authenticated;
grant execute on function public.record_page_view_with_source(text, text, text, text) to service_role;
grant execute on function public.get_traffic_source_stats(timestamptz) to service_role;
grant execute on function public.get_visit_hour_stats(timestamptz) to service_role;
