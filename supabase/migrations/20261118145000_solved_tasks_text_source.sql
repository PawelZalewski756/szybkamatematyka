-- Jedna wspólna księga rozwiązań dla WSZYSTKICH źródeł zadań:
-- trening, baza zadań, arkusze CKE, diagnoza, powtórki, minigry, wyzwania,
-- pojedynki i szybka próba.
--
-- Powód: solved_tasks.task_id był UUID z FK do public.tasks. Zadania z cache,
-- arkuszy CKE i minigier mają identyfikatory tekstowe, więc zapis kończył się
-- błędem 23503/22P02 i nie trafiał ani do statystyk, ani do XP.

do $$
begin
  if to_regclass('public.solved_tasks') is null then
    raise notice 'pomijam solved_tasks - tabela nie istnieje';
    return;
  end if;

  alter table public.solved_tasks
    alter column task_id type text using task_id::text;

  alter table public.solved_tasks
    add column if not exists source text not null default 'trening';

  if not exists (
    select 1 from pg_constraint
    where conname = 'solved_tasks_source_check'
      and conrelid = 'public.solved_tasks'::regclass
  ) then
    alter table public.solved_tasks
      add constraint solved_tasks_source_check
      check (source in (
        'trening', 'baza-zadan', 'cke', 'diagnoza', 'powtorki',
        'minigra', 'wyzwanie', 'pojedynek', 'szybka-proba'
      ));
  end if;
end $$;

create index if not exists solved_tasks_source_idx
  on public.solved_tasks (source, solved_at desc);
