-- Rozwiązania są częścią zadania, a powtórki przechowują bezpieczny snapshot
-- potrzebny do odtworzenia zadania z dowolnego źródła.

alter table public.tasks
  add column if not exists source_id text,
  add column if not exists explanation text,
  add column if not exists solution_steps jsonb not null default '[]'::jsonb;

create unique index if not exists tasks_exam_source_uidx
  on public.tasks(exam_type, source_id)
  where source_id is not null;

alter table public.review_schedule
  add column if not exists task_snapshot jsonb;

comment on column public.tasks.source_id is
  'Stabilny identyfikator źródłowy z cache/generatora; UUID wiersza może być inne.';
comment on column public.tasks.explanation is
  'Krótkie wyjaśnienie pokazywane po odpowiedzi, niezależne od asystenta AI.';
comment on column public.tasks.solution_steps is
  'Opcjonalne kroki pełnego rozwiązania w kolejności.';
comment on column public.review_schedule.task_snapshot is
  'Minimalny snapshot zadania potrzebny do powtórki, także dla zadań spoza katalogu statycznego.';

