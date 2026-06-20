"use client";

import {
  formatArkuszLabel,
  MIESIACE_PL,
} from "@/lib/baza-zadan/arkusz-format";
import {
  DZIALY_MATEMATYKI,
  TYP_EGZAMINU_LABELS,
  type TypEgzaminu,
} from "@/lib/baza-zadan/dzialy";
import {
  createArkusz,
  createZadanie,
  fetchArkusze,
  type ArkuszRow,
} from "@/lib/supabase/baza-zadan";
import { getSupabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const NEW_ARKUSZ = "__new__";

export function AdminPageClient() {
  const [arkusze, setArkusze] = useState<ArkuszRow[]>([]);
  const [loadingArkusze, setLoadingArkusze] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [arkuszMode, setArkuszMode] = useState<string>(NEW_ARKUSZ);
  const [typ, setTyp] = useState<TypEgzaminu>("matura");
  const [rok, setRok] = useState(new Date().getFullYear());
  const [miesiac, setMiesiac] = useState(() => new Date().getMonth() + 1);
  const [numerZadania, setNumerZadania] = useState(1);
  const [dzial, setDzial] = useState<string>(DZIALY_MATEMATYKI[0]);
  const [tresc, setTresc] = useState("");
  const [rozwiazanie, setRozwiazanie] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  const loadArkusze = useCallback(async () => {
    setLoadingArkusze(true);
    setError(null);
    try {
      const data = await fetchArkusze();
      setArkusze(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Nie udało się pobrać arkuszy. Uruchom migrację SQL w Supabase.",
      );
    } finally {
      setLoadingArkusze(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadArkusze();
  }, [loadArkusze]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const resetFormFields = () => {
    setNumerZadania(1);
    setTresc("");
    setRozwiazanie("");
  };

  const handleGenerateSolution = async () => {
    if (!tresc.trim()) {
      setError("Wpisz treść zadania przed wygenerowaniem rozwiązania AI.");
      return;
    }

    setGeneratingAi(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Sesja wygasła — zaloguj się ponownie.");
      }

      const res = await fetch("/api/generate-solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ trescZadania: tresc.trim() }),
      });

      const data = (await res.json()) as {
        solution?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Nie udało się wygenerować rozwiązania.");
      }

      if (!data.solution) {
        throw new Error("API nie zwróciło rozwiązania.");
      }

      setRozwiazanie(data.solution);
      setToast("Rozwiązanie AI wklejone — sprawdź i popraw przed zapisem.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Błąd połączenia z Gemini. Sprawdź GEMINI_API_KEY.",
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let arkuszId = arkuszMode;

      if (arkuszMode === NEW_ARKUSZ) {
        const created = await createArkusz({
          typ,
          rok,
          miesiac,
        });
        arkuszId = created.id;
        setArkusze((prev) => [created, ...prev]);
        setArkuszMode(created.id);
      }

      await createZadanie({
        arkusz_id: arkuszId,
        numer_zadania: numerZadania,
        dzial,
        tresc,
        rozwiazanie,
      });

      setToast("Zadanie zapisane w bazie!");
      setNumerZadania((n) => n + 1);
      setTresc("");
      setRozwiazanie("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Błąd zapisu — sprawdź Supabase.";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        setError("To zadanie o tym numerze już istnieje w arkuszu.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-zinc-500 hover:text-orange-400"       >
        ← Baza zadań
      </Link>

      <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
        Panel{" "}
        <span className="text-gradient-brand">
          Administratora
        </span>
      </h1>
      <p className="mt-2 text-zinc-400">
        Dodawaj arkusze maturalne i zadania z rozwiązaniem krok po kroku. Treść
        trafia wyłącznie do naszej bazy — uczniowie nie są przekierowywani na
        zewnętrzne strony.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Możesz oprzeć się na materiałach z innych serwisów przy pisaniu, ale
        publikujemy tylko własne opracowanie w Supabase.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/materialy"
          className="inline-flex rounded-2xl border border-orange-500/35 bg-orange-500/10 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-500/20"
        >
          Materiały teoretyczne →
        </Link>
        <Link
          href="/admin/analityka"
          className="inline-flex rounded-2xl border border-orange-500/35 bg-orange-500/10 px-5 py-2.5 text-sm font-bold text-orange-200 transition hover:bg-orange-500/20"
        >
          Analityka platformy →
        </Link>
      </div>

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

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8"
      >
        <div>
          <label className="text-sm font-bold text-zinc-300">Arkusz</label>
          <select
            value={arkuszMode}
            onChange={(e) => setArkuszMode(e.target.value)}
            disabled={loadingArkusze}
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
          >
            <option value={NEW_ARKUSZ}>➕ Dodaj nowy arkusz…</option>
            {arkusze.map((a) => (
              <option key={a.id} value={a.id}>
                {formatArkuszLabel(a)} · {TYP_EGZAMINU_LABELS[a.typ]}
              </option>
            ))}
          </select>
          {arkuszMode === NEW_ARKUSZ && (
            <p className="mt-2 text-sm text-zinc-500">
              Nowy arkusz:{" "}
              <span className="font-semibold text-zinc-300">
                {formatArkuszLabel({ nazwa: "", miesiac, rok })}
              </span>
            </p>
          )}
        </div>

        <div>
          <span className="text-sm font-bold text-zinc-300">Typ egzaminu</span>
          <div className="mt-2 flex rounded-xl border border-white/10 bg-zinc-950 p-1">
            {(Object.keys(TYP_EGZAMINU_LABELS) as TypEgzaminu[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTyp(t)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                  typ === t
                    ? t === "matura"
                      ? "bg-orange-600 text-white"
                      : "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {TYP_EGZAMINU_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-4 ${arkuszMode === NEW_ARKUSZ ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}
        >
          {arkuszMode === NEW_ARKUSZ && (
            <div>
              <label className="text-sm font-bold text-zinc-300">Miesiąc</label>
              <select
                value={miesiac}
                onChange={(e) => setMiesiac(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
              >
                {MIESIACE_PL.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-zinc-300">Rok</label>
            <input
              type="number"
              min={2000}
              max={2100}
              value={rok}
              onChange={(e) => setRok(Number(e.target.value))}
              disabled={arkuszMode !== NEW_ARKUSZ}
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-300">Numer zadania</label>
            <input
              type="number"
              min={1}
              value={numerZadania}
              onChange={(e) => setNumerZadania(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">Dział</label>
          <select
            value={dzial}
            onChange={(e) => setDzial(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
          >
            {DZIALY_MATEMATYKI.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">Treść zadania</label>
          <textarea
            value={tresc}
            onChange={(e) => setTresc(e.target.value)}
            required
            rows={5}
            placeholder="Wpisz pełną treść zadania…"
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500/50"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">
            Rozwiązanie krok po kroku
          </label>
          <motion.button
            type="button"
            onClick={() => void handleGenerateSolution()}
            disabled={generatingAi || saving}
            whileHover={generatingAi ? undefined : { scale: 1.02 }}
            whileTap={generatingAi ? undefined : { scale: 0.97 }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/40 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {generatingAi
              ? "Mielenie danych... 🧠"
              : "✨ Generuj rozwiązanie AI (Gemini Flash)"}
          </motion.button>
          <textarea
            value={rozwiazanie}
            onChange={(e) => setRozwiazanie(e.target.value)}
            required
            rows={8}
            placeholder={"Krok 1: …\nKrok 2: …\nOdpowiedź: …"}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-brand-gradient py-4 text-base font-black text-white shadow-lg shadow-orange-500/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Zapisywanie…" : "Zapisz zadanie"}
          </button>
          <button
            type="button"
            onClick={resetFormFields}
            className="rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-zinc-300 hover:bg-white/5"
          >
            Wyczyść pola
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Migracje:{" "}
        <code className="text-zinc-500">init_baza_zadan.sql</code>,{" "}
        <code className="text-zinc-500">add_arkusz_miesiac.sql</code>
      </p>
    </div>
  );
}
