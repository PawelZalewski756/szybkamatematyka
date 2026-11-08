-- Powtórki (spaced repetition): harmonogram powtórek zadań per użytkownik.
-- Algorytm SM-2 lite - stan trzymany po stronie aplikacji, tu tylko persystencja.
-- task_id jest tekstem (ID zadań z wbudowanego katalogu, np. „st-001”), więc BEZ
-- klucza obcego do public.tasks (te ID są typu uuid).
-- Uruchom w Supabase → SQL Editor (po init_profiles_avatars.sql).

create table if not exists public.review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  repetitions integer not null default 0,
  interval_days integer not null default 0,
  easiness real not null default 2.5,
  next_review_at timestamptz not null default now(),
  last_result text,
  last_reviewed_at timestamptz,
  added_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create index if not exists review_schedule_user_due_idx
  on public.review_schedule (user_id, next_review_at);

alter table public.review_schedule enable row level security;

drop policy if exists "review_schedule_select_own" on public.review_schedule;
create policy "review_schedule_select_own"
  on public.review_schedule for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "review_schedule_insert_own" on public.review_schedule;
create policy "review_schedule_insert_own"
  on public.review_schedule for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "review_schedule_update_own" on public.review_schedule;
create policy "review_schedule_update_own"
  on public.review_schedule for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "review_schedule_delete_own" on public.review_schedule;
create policy "review_schedule_delete_own"
  on public.review_schedule for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.review_schedule is 'Harmonogram powtórek (spaced repetition, SM-2 lite) - jeden wiersz na gracza i zadanie.';
