-- Anonimowy licznik wejść: tylko sumy dzienne na ścieżkę, bez identyfikatora
-- odwiedzającego, bez IP i bez zapisu czegokolwiek w przeglądarce.
create table if not exists public.daily_page_view_counts (
  day date not null,
  page_path text not null check (
    length(page_path) between 1 and 200
    and left(page_path, 1) = '/'
    and left(page_path, 2) <> '//'
  ),
  views bigint not null default 0,
  primary key (day, page_path)
);

alter table public.daily_page_view_counts enable row level security;
revoke all on table public.daily_page_view_counts from anon, authenticated;
grant all on table public.daily_page_view_counts to service_role;

create or replace function public.record_daily_page_view(p_page_path text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_page_path is null
    or length(p_page_path) not between 1 and 200
    or left(p_page_path, 1) <> '/'
    or left(p_page_path, 2) = '//'
  then
    raise exception 'Invalid page path';
  end if;

  insert into public.daily_page_view_counts (day, page_path, views)
  values ((now() at time zone 'Europe/Warsaw')::date, p_page_path, 1)
  on conflict (day, page_path)
  do update set views = public.daily_page_view_counts.views + 1;
end;
$$;

create or replace function public.get_daily_page_view_totals(p_days integer default 30)
returns table (day date, views bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select d.day, sum(d.views)::bigint
  from public.daily_page_view_counts d
  where d.day >= (now() at time zone 'Europe/Warsaw')::date - greatest(p_days, 1)
  group by d.day
  order by d.day desc;
$$;

revoke all on function public.record_daily_page_view(text) from public, anon, authenticated;
revoke all on function public.get_daily_page_view_totals(integer) from public, anon, authenticated;
grant execute on function public.record_daily_page_view(text) to service_role;
grant execute on function public.get_daily_page_view_totals(integer) to service_role;
