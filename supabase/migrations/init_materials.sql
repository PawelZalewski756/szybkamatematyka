-- Materiały teoretyczne per temat (arena treningowa)
-- Uruchom w Supabase → SQL Editor
--
-- content: Markdown + LaTeX (remark-math / KaTeX w aplikacji)
-- Przykład INSERT (użyj $$ w SQL, żeby nie uciekały backslashe):
--
-- insert into public.materials (exam_type, category, topic, title, content)
-- values (
--   'matura_podstawowa', 'algebra', 'rownania', 'Równania kwadratowe',
--   $md$
-- ## Wzór
--
-- Wielomian $ax^2+bx+c$ ma pierwiastki:
--
-- $$
-- x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
-- $$
--
-- - Dla $\Delta > 0$ - dwa pierwiastki rzeczywiste
-- - Dla $\Delta = 0$ - jeden pierwiastek podwójny
-- $md$
-- );

create extension if not exists "pgcrypto";

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  exam_type text not null,
  category text not null,
  topic text not null,
  title text not null,
  content text not null,
  video_url text,
  created_at timestamptz default now()
);

create index materials_topic_idx on public.materials (exam_type, category, topic);

alter table public.materials enable row level security;

create policy materials_select_all on public.materials for select to anon, authenticated using (true);
