"use client";

import { DatabaseSetupCard } from "@/components/baza-zadan/DatabaseSetupCard";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import {
  arkuszMaturaBadge,
  groupCmsTasksByYear,
  splitCmsTasks,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import {
  groupOfficialCkeSheetsByYear,
  officialCkeSheetHref,
  officialCkeSheetKind,
} from "@/lib/baza-zadan/exams/archive-sheet-meta";
import type { ExamArchiveSheetMeta } from "@/lib/baza-zadan/exams/archive-types";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { motion } from "framer-motion";
import { FileText, GraduationCap, School } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ArkuszeCkeCatalogProps = {
  archiveSheets: ExamArchiveSheetMeta[];
  cmsTasks?: ZadanieWithArkusz[];
  schemaMissing?: boolean;
  errorNote?: string | null;
};

function ArchiveSheetCard({ sheet }: { sheet: ExamArchiveSheetMeta }) {
  const kindLabel =
    officialCkeSheetKind(sheet) === "egzamin-8"
      ? "Egzamin 8-klasisty"
      : "CKE · podstawowa";

  return (
    <Link
      href={officialCkeSheetHref(sheet.id)}
      className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl hover:ring-emerald-400/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
          <FileText className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full border border-white/10 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
          {kindLabel}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-black text-white group-hover:text-orange-400">
          {sheet.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          {sheet.taskIds.length} zadań · rozwiązania krok po kroku
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-orange-300/90 opacity-0 transition-opacity group-hover:opacity-100">
          Otwórz arkusz →
        </p>
      </div>
    </Link>
  );
}

function CmsArkuszCard({
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
              : "border-orange-500/30 bg-orange-500/15 text-amber-400"
          }`}
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
      </div>
    </Link>
  );
}

function CmsYearSection({
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
  if (groups.length === 0 || yearGroups.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-5 w-5 ${accent === "emerald" ? "text-emerald-400" : "text-orange-400"}`}
          aria-hidden
        />
        <div className="flex flex-col">
          <h2 className="text-lg font-black text-white sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8 space-y-10">
        {yearGroups.map(({ year, groups: yearItems }) => (
          <div key={year}>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-500">
              Rok {year}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {yearItems.map((group) => (
                <CmsArkuszCard
                  key={group.arkuszId}
                  group={group}
                  accent={accent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArkuszeCkeCatalog({
  archiveSheets,
  cmsTasks = [],
  schemaMissing = false,
  errorNote,
}: ArkuszeCkeCatalogProps) {
  const { otherGroups } = splitCmsTasks(cmsTasks);
  const e8Groups = otherGroups.filter((group) => group.typ === "egzamin-8");
  const extraCmsGroups = otherGroups.filter(
    (group) => group.typ !== "egzamin-8",
  );

  const archiveYears = useMemo(
    () => [...new Set(archiveSheets.map((sheet) => sheet.year))].sort((a, b) => b - a),
    [archiveSheets],
  );

  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const filteredArchive = useMemo(
    () =>
      yearFilter === "all"
        ? archiveSheets
        : archiveSheets.filter((sheet) => sheet.year === yearFilter),
    [archiveSheets, yearFilter],
  );

  const archiveByYear = groupOfficialCkeSheetsByYear(filteredArchive);
  const archiveMatura = archiveByYear
    .map((entry) => ({
      ...entry,
      sheets: entry.sheets.filter(
        (sheet) => officialCkeSheetKind(sheet) === "matura",
      ),
    }))
    .filter((entry) => entry.sheets.length > 0);
  const archiveE8 = archiveByYear
    .map((entry) => ({
      ...entry,
      sheets: entry.sheets.filter(
        (sheet) => officialCkeSheetKind(sheet) === "egzamin-8",
      ),
    }))
    .filter((entry) => entry.sheets.length > 0);

  const hasArchive = archiveSheets.length > 0;

  return (
    <div className="page-container relative z-10 w-full py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          Arkusze{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            CKE
          </span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Oficjalne sesje matury podstawowej.{" "}
          <Link
            href="/baza-zadan"
            className="font-semibold text-orange-400 hover:text-orange-200"
          >
            Pełny katalog →
          </Link>
        </p>
      </motion.div>

      {schemaMissing && !hasArchive && (
        <div className="mt-8">
          <DatabaseSetupCard />
        </div>
      )}

      {errorNote && !hasArchive && (
        <p className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {errorNote}
        </p>
      )}

      {hasArchive && archiveYears.length > 1 && (
        <label className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
          <span className="shrink-0 font-semibold">Rok:</span>
          <select
            value={yearFilter === "all" ? "all" : String(yearFilter)}
            onChange={(event) => {
              const value = event.target.value;
              setYearFilter(value === "all" ? "all" : Number(value));
            }}
            className="rounded-lg border border-white/15 bg-zinc-900/80 px-3 py-1.5 text-sm font-semibold text-zinc-200 outline-none focus:border-orange-500/40"
          >
            <option value="all">Wszystkie</option>
            {archiveYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      )}

      {!hasArchive && e8Groups.length === 0 && extraCmsGroups.length === 0 && !schemaMissing && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="text-lg font-black text-white">Brak arkuszy</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Oficjalne sesje CKE powinny być w archiwum aplikacji. Sprawdź
            wdrożenie albo wróć do treningu tematycznego.
          </p>
        </div>
      )}

      {archiveMatura.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-400" aria-hidden />
            <div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Matura CKE — oficjalne sesje
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Poziom podstawowy, od najnowszych sesji.
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-10">
            {archiveMatura.map(({ year, sheets }) => (
              <div key={year}>
                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-500">
                  Rok {year}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => (
                    <ArchiveSheetCard key={sheet.id} sheet={sheet} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {archiveE8.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-orange-400" aria-hidden />
            <div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Egzamin ósmoklasisty
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Oficjalne arkusze CKE dla klasy 8.
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-10">
            {archiveE8.map(({ year, sheets }) => (
              <div key={year}>
                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-500">
                  Rok {year}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => (
                    <ArchiveSheetCard key={sheet.id} sheet={sheet} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasArchive && archiveE8.length === 0 && e8Groups.length === 0 && (
        <p className="mt-8 text-sm text-zinc-500">
          Egzamin ósmoklasisty pojawi się tutaj po imporcie oficjalnych arkuszy
          CKE.
        </p>
      )}

      <CmsYearSection
        title="Egzamin ósmoklasisty"
        subtitle="Arkusze z bazy serwisu"
        groups={e8Groups}
        accent="cyan"
        icon={School}
        yearFilter="all"
      />

      <CmsYearSection
        title="Dodatkowe arkusze"
        subtitle="Materiały spoza oficjalnego archiwum CKE"
        groups={extraCmsGroups}
        accent="cyan"
        icon={GraduationCap}
        yearFilter="all"
      />
    </div>
  );
}
