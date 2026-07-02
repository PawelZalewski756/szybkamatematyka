"use client";

import {
  deleteMaterial,
  fetchAllMaterials,
  fetchMaterialById,
  upsertMaterial,
} from "@/lib/supabase/materials";
import {
  findCkeTopicLabel,
  getCkeCategoriesForExam,
} from "@/lib/trening/cke-curriculum";
import type { ExamType, Material } from "@/types/database";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

type EditorTab = "edit" | "preview";

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: "matura_podstawowa", label: "Matura podstawowa" },
  { value: "matura_rozszerzona", label: "Matura rozszerzona" },
  { value: "8_klasa", label: "Egzamin 8-klasisty" },
];

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: "Matura pod.",
  matura_rozszerzona: "Matura roz.",
  "8_klasa": "Egzamin 8",
};

function emptyForm() {
  return {
    exam_type: "matura_podstawowa" as ExamType,
    category: "",
    topic: "",
    title: "",
    content: "",
    video_url: "",
  };
}

function MaterialyAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [rows, setRows] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [editorTab, setEditorTab] = useState<EditorTab>("edit");
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreviewContent(form.content);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [form.content]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllMaterials();
      setRows(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Nie udało się pobrać materiałów. Sprawdź Supabase i migrację init_materials.sql.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!editId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(emptyForm());
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const row = await fetchMaterialById(editId);
        if (cancelled) return;
        if (!row) {
          setError("Nie znaleziono materiału o podanym ID.");
          return;
        }
        setForm({
          exam_type: row.exam_type,
          category: row.category,
          topic: row.topic,
          title: row.title,
          content: row.content,
          video_url: row.video_url ?? "",
        });
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Błąd wczytywania materiału.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const ckeCategories = useMemo(
    () => getCkeCategoriesForExam(form.exam_type),
    [form.exam_type],
  );

  const selectedCategory = useMemo(
    () => ckeCategories?.find((category) => category.slug === form.category),
    [ckeCategories, form.category],
  );

  const handleExamTypeChange = (examType: ExamType) => {
    setForm((current) => ({
      ...current,
      exam_type: examType,
      category: "",
      topic: "",
    }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    setForm((current) => ({
      ...current,
      category: categorySlug,
      topic: "",
    }));
  };

  const handleTopicChange = (topicSlug: string) => {
    setForm((current) => {
      const topicLabel =
        findCkeTopicLabel(current.exam_type, current.category, topicSlug) ??
        topicSlug;
      return {
        ...current,
        topic: topicSlug,
        title: current.title || topicLabel,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const saved = await upsertMaterial({
        id: editId ?? undefined,
        exam_type: form.exam_type,
        category: form.category,
        topic: form.topic,
        title: form.title,
        content: form.content,
        video_url: form.video_url || null,
      });
      setToast(editId ? "Materiał zaktualizowany." : "Materiał dodany.");
      await loadList();
      if (!editId) {
        router.replace(`/admin/materialy?id=${saved.id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Błąd zapisu — uruchom add_tasks_materials_insert.sql w Supabase.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm("Usunąć ten materiał? Tej operacji nie cofniesz.")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteMaterial(editId);
      setToast("Materiał usunięty.");
      router.replace("/admin/materialy");
      setForm(emptyForm());
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się usunąć.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/admin"
        className="text-sm font-semibold text-zinc-500 hover:text-orange-400"       >
        ← Panel administratora
      </Link>

      <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
        Materiały{" "}
        <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
          teoretyczne
        </span>
      </h1>
      <p className="mt-2 text-zinc-400">
        Treść Markdown + LaTeX per temat (exam_type / category / topic). Wideo
        opcjonalne.
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-center font-bold text-emerald-200"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,minmax(0,22rem)]">
        <section className="min-w-0 rounded-3xl border border-white/10 bg-zinc-900/80 p-4 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-white">Lista ({rows.length})</h2>
            <Link
              href="/admin/materialy"
              className="shrink-0 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-orange-500/20"
            >
              + Nowy
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Ładowanie…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Brak materiałów — dodaj pierwszy formularzem po prawej lub uruchom{" "}
              <code className="text-zinc-400">npm run seed:trening-tasks</code>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="pb-2 pr-3">Egzamin</th>
                    <th className="pb-2 pr-3">Dział</th>
                    <th className="pb-2 pr-3">Temat</th>
                    <th className="pb-2">Tytuł</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const active = editId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                          active ? "bg-orange-500/10" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-3 text-zinc-400">
                          {EXAM_LABEL[row.exam_type]}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-zinc-300">
                          {row.category}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-zinc-300">
                          {row.topic}
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/admin/materialy?id=${row.id}`}
                            className="font-semibold text-white hover:text-orange-200"
                          >
                            {row.title}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-xl sm:p-6"
        >
          <h2 className="text-lg font-black text-white">
            {editId ? "Edycja" : "Nowy materiał"}
          </h2>

          <div>
            <label className="text-sm font-bold text-zinc-300">Egzamin</label>
            <select
              value={form.exam_type}
              onChange={(e) =>
                handleExamTypeChange(e.target.value as ExamType)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
            >
              {EXAM_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">Dział</label>
            {ckeCategories ? (
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
              >
                <option value="">Wybierz dział…</option>
                {ckeCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name} ({category.slug})
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                required
                placeholder="np. algebra"
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-orange-500/50"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">Temat</label>
            {selectedCategory ? (
              <select
                value={form.topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
              >
                <option value="">Wybierz temat…</option>
                {selectedCategory.topics.map((topic) => (
                  <option key={topic.slug} value={topic.slug}>
                    {topic.name} ({topic.slug})
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                required
                placeholder="np. rownania_liniowe"
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-orange-500/50"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">Tytuł</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-zinc-300">
                Treść (Markdown)
              </label>
              <div
                role="tablist"
                aria-label="Edycja materiału"
                className="flex rounded-xl border border-white/10 bg-zinc-950/80 p-0.5"
              >
                {(
                  [
                    { id: "edit" as const, label: "Edycja" },
                    { id: "preview" as const, label: "Podgląd" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={editorTab === tab.id}
                    onClick={() => setEditorTab(tab.id)}
                    className={`rounded-lg px-3 py-1 text-[11px] font-bold transition ${
                      editorTab === tab.id
                        ? "bg-orange-500/20 text-orange-400"                         : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {editorTab === "edit" ? (
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                required
                rows={10}
                placeholder="## Wzór&#10;&#10;$$ x = ... $$"
                className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-xs text-white outline-none focus:border-emerald-500/50"
              />
            ) : (
              <div
                role="tabpanel"
                className="mt-2 min-h-[12rem] rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-4"
              >
                {previewContent.trim() ? (
                  <TheoryMarkdown content={previewContent} />
                ) : (
                  <p className="text-sm text-zinc-500">
                    Wpisz treść w zakładce Edycja — podgląd odświeża się po 300 ms.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">
              URL wideo (opcjonalnie)
            </label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, video_url: e.target.value }))
              }
              placeholder="https://…"
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-500/25 disabled:opacity-60"
          >
            {saving ? "Zapisywanie…" : editId ? "Zapisz zmiany" : "Dodaj materiał"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving}
              className="w-full rounded-2xl border border-red-500/40 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
            >
              Usuń materiał
            </button>
          )}
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        RLS:{" "}
        <code className="text-zinc-500">add_tasks_materials_insert.sql</code>
      </p>
    </div>
  );
}

export function MaterialyPageClient() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-12 text-center text-zinc-500">Ładowanie…</div>
      }
    >
      <MaterialyAdminContent />
    </Suspense>
  );
}
