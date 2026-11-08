/**
 * Usuwa z Supabase (tasks) zadania z naszej sesji Gemini SVG
 * oraz czyści lokalny cache figure-tasks.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  contentFingerprint,
  taskContentForDb,
} from "../lib/gemini/format-tasks";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/tasks-cache");

async function main() {
  const dry = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Brak Supabase w .env.local");

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fingerprints = new Set<string>();
  const meta: Array<{ id: string; topic: string; fp: string }> = [];

  for (const f of fs.readdirSync(CACHE_DIR)) {
    if (!f.endsWith(".json")) continue;
    if (f.includes("review") || f.includes("manifest")) continue;
    // zostaw stary plik sprzed sesji figure (bez SVG) - ciag_arytmetyczny
    const full = path.join(CACHE_DIR, f);
    const j = JSON.parse(fs.readFileSync(full, "utf8"));
    for (const t of j.tasks || []) {
      if (!t.figure_svg) continue;
      const fp = contentFingerprint(taskContentForDb(t));
      fingerprints.add(fp);
      meta.push({ id: t.id, topic: `${j.category}/${j.topic}`, fp });
    }
  }

  console.log(`Cache SVG do usunięcia: ${meta.length} (unikalne fp: ${fingerprints.size})`);

  // Pobierz wszystkie tasks z SVG (inline) - bezpieczniej kasować po fingerprint
  const { data, error } = await supabase
    .from("tasks")
    .select("id,content,category,topic")
    .ilike("content", "%data:image/svg+xml%");

  if (error) throw new Error(error.message);

  const toDelete = (data || []).filter((row) =>
    fingerprints.has(contentFingerprint(row.content)),
  );

  // Dodatkowo: wszystko z cache topics z dzisiejszej sesji, nawet bez match -
  // jeśli content fingerprint nie złapie przez drobne różnice, kasuj po topic+svg
  // ale NIE kasuj starych SVG spoza naszej sesji (procenty itd.)
  console.log(`Dopasowane w DB po fingerprint: ${toDelete.length} / SVG w DB: ${(data || []).length}`);

  if (dry) {
    for (const row of toDelete.slice(0, 20)) {
      console.log(" dry", row.id.slice(0, 8), row.category, row.topic);
    }
    return;
  }

  let deleted = 0;
  for (const row of toDelete) {
    const { error: delErr } = await supabase.from("tasks").delete().eq("id", row.id);
    if (delErr) console.warn("del fail", row.id, delErr.message);
    else deleted += 1;
  }
  console.log(`Usunięto z DB: ${deleted}`);

  // Wyczyść lokalny cache figure (zostaw ciag_arytmetyczny bez SVG)
  for (const f of fs.readdirSync(CACHE_DIR)) {
    if (!f.endsWith(".json")) continue;
    if (f.includes("review") || f.includes("manifest")) {
      fs.unlinkSync(path.join(CACHE_DIR, f));
      console.log("rm", f);
      continue;
    }
    const full = path.join(CACHE_DIR, f);
    const j = JSON.parse(fs.readFileSync(full, "utf8"));
    const before = (j.tasks || []).length;
    j.tasks = (j.tasks || []).filter((t: { figure_svg?: string | null }) => !t.figure_svg);
    if (j.tasks.length === 0 && f !== "matura_podstawowa__ciagi__ciag_arytmetyczny.json") {
      fs.unlinkSync(full);
      console.log("rm empty", f, `(było ${before})`);
    } else if (j.tasks.length !== before) {
      j.updatedAt = new Date().toISOString();
      fs.writeFileSync(full, JSON.stringify(j, null, 2));
      console.log("strip svg", f, `${before}→${j.tasks.length}`);
    }
  }

  // preview dir
  const preview = path.join(CACHE_DIR, "svg-preview");
  if (fs.existsSync(preview)) {
    fs.rmSync(preview, { recursive: true, force: true });
    console.log("rm svg-preview/");
  }
  const log = path.join(CACHE_DIR, "figures-session.log");
  if (fs.existsSync(log)) fs.unlinkSync(log);

  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .ilike("content", "%data:image/svg+xml%");
  console.log(`Pozostało SVG w tasks: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
