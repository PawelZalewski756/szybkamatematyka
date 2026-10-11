create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
  page_path text not null check (
    length(page_path) between 1 and 200
    and left(page_path, 1) = '/'
    and left(page_path, 2) <> '//'
  ),
  visited_at timestamptz not null default now()
);

create index if not exists page_views_visited_at_idx
  on public.page_views (visited_at desc);
create index if not exists page_views_visitor_hash_idx
  on public.page_views (visitor_hash);

alter table public.page_views enable row level security;
revoke all on table public.page_views from anon, authenticated;
grant all on table public.page_views to service_role;

create or replace function public.record_page_view(
  p_visitor_hash text,
  p_page_path text
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
  then
    raise exception 'Invalid page-view data';
  end if;

  insert into public.page_views (visitor_hash, page_path)
  values (p_visitor_hash, p_page_path);
end;
$$;

create or replace function public.get_page_view_stats(p_since timestamptz default null)
returns table (total_views bigint, unique_visitors bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    count(*)::bigint,
    count(distinct visitor_hash)::bigint
  from public.page_views
  where p_since is null or visited_at >= p_since;
$$;

revoke all on function public.record_page_view(text, text) from public, anon, authenticated;
revoke all on function public.get_page_view_stats(timestamptz) from public, anon, authenticated;
grant execute on function public.record_page_view(text, text) to service_role;
grant execute on function public.get_page_view_stats(timestamptz) to service_role;
