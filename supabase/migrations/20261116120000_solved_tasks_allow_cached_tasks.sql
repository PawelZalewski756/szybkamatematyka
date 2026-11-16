-- Postęp treningu: zadania spoza tabeli public.tasks.
--
-- Część zadań treningowych jest serwowana z cache (data/tasks-cache,
-- /api/trening/tasks) i nie musi istnieć w public.tasks. Klucz obcy
-- solved_tasks.task_id -> tasks.id blokował wtedy zapis (błąd 23503),
-- więc uczeń widział 0 rozwiązanych zadań, nie dostawał XP, a panel admina
-- i bot Telegram nie miały czego policzyć.
--
-- Po tej migracji solved_tasks przechowuje identyfikator zadania bez FK.
-- Identyfikatory z cache są UUID-ami, więc typ kolumny się nie zmienia.

do $$
declare
  constraint_name text;
begin
  if to_regclass('public.solved_tasks') is null then
    raise notice 'pomijam solved_tasks - tabela nie istnieje (uruchom init_solved_tasks.sql)';
    return;
  end if;

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
  end loop;
end $$;

create index if not exists solved_tasks_solved_at_idx
  on public.solved_tasks (solved_at desc);

create index if not exists solved_tasks_user_solved_at_idx
  on public.solved_tasks (user_id, solved_at desc);

-- Statystyki platformy (panel admina / bot) liczą DISTINCT user_id oraz sumy
-- w oknach 7/30 dni - powyższe indeksy wystarczają przy typowej skali.
