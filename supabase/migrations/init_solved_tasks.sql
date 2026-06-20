-- Postęp areny: rozwiązane zadania (anti-XP-farm)
-- Uruchom w Supabase → SQL Editor (po init_tasks.sql)

create table if not exists public.solved_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  solved_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create index if not exists solved_tasks_user_id_idx on public.solved_tasks (user_id);

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
