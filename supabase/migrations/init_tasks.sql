-- Arena treningowa: zadania wielokrotnego wyboru po temacie
-- Uruchom w Supabase → SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  exam_type text not null check (
    exam_type in ('matura_podstawowa', 'matura_rozszerzona', '8_klasa')
  ),
  category text not null,
  topic text not null,
  difficulty integer not null default 1 check (difficulty between 1 and 3),
  content text not null,
  correct_answer text not null,
  options jsonb not null default '[]'::jsonb,
  xp_reward integer not null default 10 check (xp_reward >= 0),
  created_at timestamptz not null default now()
);

create index if not exists tasks_exam_category_topic_idx
  on public.tasks (exam_type, category, topic);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_all" on public.tasks;
create policy "tasks_select_all"
  on public.tasks for select
  to anon, authenticated
  using (true);
