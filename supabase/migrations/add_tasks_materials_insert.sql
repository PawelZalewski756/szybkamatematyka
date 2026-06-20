-- Zapis zadań areny treningowej i materiałów teoretycznych (seed / admin)
-- Uruchom w Supabase SQL Editor po init_tasks.sql i init_materials.sql

drop policy if exists "tasks_insert_all" on public.tasks;
drop policy if exists "tasks_update_all" on public.tasks;
drop policy if exists "tasks_delete_all" on public.tasks;
drop policy if exists "materials_insert_all" on public.materials;
drop policy if exists "materials_update_all" on public.materials;
drop policy if exists "materials_delete_all" on public.materials;

create policy "tasks_insert_all"
  on public.tasks for insert
  to anon, authenticated
  with check (true);

create policy "tasks_update_all"
  on public.tasks for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "tasks_delete_all"
  on public.tasks for delete
  to anon, authenticated
  using (true);

create policy "materials_insert_all"
  on public.materials for insert
  to anon, authenticated
  with check (true);

create policy "materials_update_all"
  on public.materials for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "materials_delete_all"
  on public.materials for delete
  to anon, authenticated
  using (true);
