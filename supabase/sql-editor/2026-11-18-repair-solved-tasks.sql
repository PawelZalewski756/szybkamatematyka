-- Naprawa zapisu rozwiązań: solved_tasks
-- Uruchom w Supabase → SQL Editor → Run. Skrypt jest idempotentny.
--
-- Objawy: użytkownik zalogowany rozwiązuje zadanie, ale /users i /solved
-- pokazują 0. W bazie są stare wiersze tylko jednego konta.

do $$
declare
  constraint_name text;
begin
  if to_regclass('public.solved_tasks') is null then
    raise exception 'Brak tabeli public.solved_tasks - uruchom init_solved_tasks.sql';
  end if;

  -- 1. Usuń FK na task_id (cache/minigry mają tekstowe ID spoza public.tasks).
  for constraint_name in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.solved_tasks'::regclass
      and con.contype = 'f'
      and exists (
        select 1
        from unnest(con.conkey) as key(attnum)
        join pg_attribute att
          on att.attrelid = con.conrelid
         and att.attnum = key.attnum
        where att.attname = 'task_id'
      )
  loop
    execute format(
      'alter table public.solved_tasks drop constraint %I',
      constraint_name
    );
    raise notice 'Usunięto FK % na solved_tasks.task_id', constraint_name;
  end loop;

  -- 2. task_id musi być tekstem (UUID, CKE, minigry, pojedynki).
  alter table public.solved_tasks
    alter column task_id type text using task_id::text;

  -- 3. source: dodaj/uzupełnij i ustaw domyślną wartość.
  alter table public.solved_tasks
    add column if not exists source text;

  update public.solved_tasks
     set source = 'trening'
   where source is null or btrim(source) = '';

  alter table public.solved_tasks
    alter column source set default 'trening';

  alter table public.solved_tasks
    alter column source set not null;

  -- 4. solved_at musi mieć default, inaczej insert bez tej kolumny failuje.
  alter table public.solved_tasks
    alter column solved_at set default now();

  -- 5. Constraint źródeł - usuń starą wersję i dodaj aktualną.
  alter table public.solved_tasks
    drop constraint if exists solved_tasks_source_check;

  alter table public.solved_tasks
    add constraint solved_tasks_source_check
    check (source in (
      'trening', 'baza-zadan', 'cke', 'diagnoza', 'powtorki',
      'minigra', 'wyzwanie', 'pojedynek', 'szybka-proba'
    ));
end $$;

-- 6. RLS: własne wiersze dla zalogowanych.
alter table public.solved_tasks enable row level security;

drop policy if exists "solved_tasks_select_own" on public.solved_tasks;
create policy "solved_tasks_select_own"
  on public.solved_tasks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "solved_tasks_insert_own" on public.solved_tasks;
create policy "solved_tasks_insert_own"
  on public.solved_tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 7. Uprawnienia tabeli (RLS nadal ogranicza wiersze).
grant usage on schema public to anon, authenticated, service_role;
grant select, insert on public.solved_tasks to authenticated;
grant all on public.solved_tasks to service_role;

-- 8. Odśwież cache schematu PostgREST.
notify pgrst, 'reload schema';

-- 9. Szybka kontrola (wynik zobaczysz jako ostatni SELECT).
select
  count(*) as wszystkie,
  count(distinct user_id) as uczniowie,
  count(*) filter (where source = 'trening') as trening,
  count(*) filter (where source = 'minigra') as minigry,
  count(*) filter (where source = 'baza-zadan') as baza,
  count(*) filter (where source = 'cke') as cke
from public.solved_tasks;
