-- Usuwa zadania dodane automatycznie (import z katalogu).
-- Uruchom przed ponownym: npm run seed:auto -- --replace --limit=20

delete from public.zadania
where source_id is not null;
