"use client";

import { DatabaseSetupCard } from "@/components/baza-zadan/DatabaseSetupCard";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import {
  arkuszMaturaBadge,
  groupCmsTasksByYear,
  isCkeMaturaArkusz,
  maturaPoziomFromNazwa,
  splitCmsTasks,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { motion } from "framer-motion";
import { FileText, GraduationCap, School } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ArkuszeCkeCatalogProps = {
  cmsTasks: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  errorNote?: string | null;
};

function ArkuszCard({
  group,
  accent,
}: {
  group: CmsArkuszGroup;
  accent: "emerald" | "cyan";
}) {
  const sample = group.tasks[0];
  const arkusz = sample?.arkusz;
  const label = arkusz ? formatArkuszLabel(arkusz) : group.label;
  const href = `/arkusze/${group.arkuszId}`;
  const sourceBadge =
    sample && group.typ === "matura" ? arkuszMaturaBadge(sample) : null;

  const ring =
    accent === "emerald"
      ? "hover:ring-emerald-400/40 hover:shadow-emerald-500/10"
      : "hover:ring-orange-500/40 hover:shadow-orange-500/10";

  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl ${ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            accent === "emerald"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : "border-orange-500/30 bg-orange-500/15 text-amber-400"           }`}
        >
          <FileText className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full border border-white/10 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
          {sourceBadge ?? TYP_EGZAMINU_LABELS[group.typ]}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-black text-white group-hover:text-orange-400">
          {label}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          {group.tasks.length} zadań · rozwiązania krok po kroku
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-orange-300/90 opacity-0 transition-opacity group-hover:opacity-100">
          Otwórz arkusz →
        </p>
      </div>
    </Link>
  );
}

function YearSection({
  title,
  subtitle,
  groups,
  accent,
  icon: Icon,
  yearFilter,
}: {
  title: string;
  subtitle: string;
  groups: CmsArkuszGroup[];
  accent: "emerald" | "cyan";
  icon: typeof GraduationCap;
  yearFilter: number | "all";
}) {
  const yearGroups = groupCmsTasksByYear(groups).filter(
    ({ year }) => yearFilter === "all" || year === yearFilter,
  );
  if (groups.length === 0) return null;
  if (yearGroups.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-5 w-5 ${accent === "emerald" ? "text-emerald-400" : "text-orange-400"}`}
          aria-hidden
        />
        <div className="flex flex-col">
          <h2 className="text-lg font-black text-white sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {yearGroups.map(({ year, groups: yearItems }) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
          >
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-500">
              Rok {year}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {yearItems.map((group) => (
                <ArkuszCard key={group.arkuszId} group={group} accent={accent} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function ArkuszeCkeCatalog({
  cmsTasks,
  schemaMissing = false,
  errorNote,
}: ArkuszeCkeCatalogProps) {
  const { ckeGroups, otherGroups } = splitCmsTasks(cmsTasks);

  const e8Groups = otherGroups.filter((g) => g.typ === "egzamin-8");
  const treningMaturaGroups = otherGroups.filter(
    (g) => g.typ === "matura" && !isCkeMaturaArkusz(g.tasks[0]!),
  );

  const hasContent =
    ckeGroups.length > 0 ||
    treningMaturaGroups.length > 0 ||
    e8Groups.length > 0;

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const g of [...ckeGroups, ...treningMaturaGroups, ...e8Groups]) {
      const y = g.tasks[0]?.arkusz.rok;
      if (y) years.add(y);
    }
    return [...years].sort((a, b) => b - a);
  }, [ckeGroups, treningMaturaGroups, e8Groups]);

  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [maturaFilter, setMaturaFilter] = useState<
    "all" | "podstawowa" | "rozszerzona" | "cke" | "trening"
  >("all");

  const filteredCkeGroups = useMemo(() => {
    return ckeGroups.filter((g) => {
      const sample = g.tasks[0];
      if (!sample) return false;
      if (maturaFilter === "all" || maturaFilter === "cke") return true;
      if (maturaFilter === "trening") return false;
      const poziom = maturaPoziomFromNazwa(sample.arkusz.nazwa);
      if (maturaFilter === "podstawowa") return poziom !== "rozszerzona";
      return poziom === "rozszerzona";
    });
  }, [ckeGroups, maturaFilter]);

  const showTreningSection =
    maturaFilter === "all" || maturaFilter === "trening";

  const hasRozszerzona = useMemo(
    () =>
      ckeGroups.some(
        (g) =>
          maturaPoziomFromNazwa(g.tasks[0]?.arkusz.nazwa ?? "") ===
          "rozszerzona",
      ),
    [ckeGroups],
  );

  return (
    <div className="page-container relative z-10 w-full py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          Arkusze{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">CKE</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Oficjalne sesje maturalne i egzamin ósmoklasisty.{" "}
          <Link href="/baza-zadan" className="font-semibold text-orange-400 hover:text-orange-200">
            Pełny katalog →
          </Link>
        </p>
      </motion.div>

      {schemaMissing && (
        <div className="mt-8">
          <DatabaseSetupCard />
        </div>
      )}

      {errorNote && (
        <p className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {errorNote}
        </p>
      )}

      {(ckeGroups.length > 0 || treningMaturaGroups.length > 0) && (
        <div
          role="group"
          aria-label="Filtr matury"
          className="mt-6 flex flex-wrap gap-2"
        >
          {(
            [
              ["all", "Wszystkie matury"],
              ["podstawowa", "Podstawowa"],
              ["cke", "CKE oficjalne"],
              ["trening", "Trening"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMaturaFilter(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                maturaFilter === key
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
                  : "border-white/15 bg-white/5 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
          {hasRozszerzona && (
            <button
              type="button"
              onClick={() => setMaturaFilter("rozszerzona")}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                maturaFilter === "rozszerzona"
                  ? "border-orange-400/50 bg-orange-500/20 text-orange-100"
                  : "border-white/15 bg-white/5 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Rozszerzona
            </button>
          )}
        </div>
      )}

      {hasContent && availableYears.length > 0 && (
        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <span className="shrink-0 font-semibold">Rok:</span>
          <select
            value={yearFilter === "all" ? "all" : String(yearFilter)}
            onChange={(e) => {
              const v = e.target.value;
              setYearFilter(v === "all" ? "all" : Number(v));
            }}
            className="rounded-lg border border-white/15 bg-zinc-900/80 px-3 py-1.5 text-sm font-semibold text-zinc-200 outline-none focus:border-orange-500/40"
          >
            <option value="all">Wszystkie</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      )}

      {!schemaMissing && !hasContent && !errorNote && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="text-lg font-black text-white">Brak arkuszy w bazie</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Uruchom import CKE (<code className="text-amber-400">npm run seed:cke-matura</code>)
            lub dodaj arkusze skryptem seed.
          </p>
        </div>
      )}

      {filteredCkeGroups.length > 0 && (
        <YearSection
          title="Matura CKE — oficjalne sesje"
          subtitle="Sesje maturalne poziom podstawowy — po latach (najnowsze na górze), w roku: maj, czerwiec…"
          groups={filteredCkeGroups}
          accent="emerald"
          icon={GraduationCap}
          yearFilter={yearFilter}
        />
      )}

      {showTreningSection && treningMaturaGroups.length > 0 && (
        <YearSection
          title="Matura — arkusze treningowe"
          subtitle="Arkusze z aplikacji — oddzielnie od oficjalnych sesji CKE"
          groups={treningMaturaGroups}
          accent="cyan"
          icon={GraduationCap}
          yearFilter={yearFilter}
        />
      )}

      <YearSection
        title="Egzamin 8-klasisty"
        subtitle="Arkusze egzaminacyjne dla ósmoklasistów"
        groups={e8Groups}
        accent="cyan"
        icon={School}
        yearFilter={yearFilter}
      />
    </div>
  );
}
