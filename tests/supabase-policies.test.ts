import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

function readMigration(name: string): string {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8");
}

/**
 * Regresja bezpieczeństwa: publiczny klucz Supabase trafia do bundle'a, więc
 * żadna migracja nie może otwierać zapisu do treści dla anon/authenticated
 * bez sprawdzenia administratora.
 */
describe("polityki RLS dla treści", () => {
  it("plik seedowy nie otwiera zapisu dla anon/authenticated", () => {
    const sql = readMigration("add_tasks_materials_insert.sql").toLowerCase();
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain("with check (true)");
  });

  it("production_hardening ogranicza zapis treści do is_admin()", () => {
    const sql = readMigration("20260906220000_production_hardening.sql");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("for select to anon, authenticated");
    expect(sql).toContain("for insert to authenticated with check (public.is_admin())");
  });
});
