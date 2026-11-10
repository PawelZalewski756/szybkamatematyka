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
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchZadaniaCatalogSafe,
  type ZadanieWithArkusz,
} from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import { motion } from "framer-motion";
import { FileText, GraduationCap, School } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
      : /rozszerzon/i.test(sheet.title)
        ? "CKE · rozszerzona"
        : "CKE · podstawowa";

  return (
    <Link
      href={officialCkeSheetHref(sheet.id)}
      className="card-raised group flex min-h-[11rem] flex-col justify-between p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="icon-chip flex h-11 w-11 shrink-0 rounded-xl">
          <FileText className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full border border-surface-border bg-surface-hover px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted">
          {kindLabel}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-accent">
          {sheet.title}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {sheet.taskIds.length} zadań · rozwiązania krok po kroku
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-accent transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          Otwórz arkusz →
        </p>
      </div>
    </Link>
  );
}

function CmsArkuszCard({
  group,
}: {
  group: CmsArkuszGroup;
}) {
  const sample = group.tasks[0];
  const arkusz = sample?.arkusz;
  const label = arkusz ? formatArkuszLabel(arkusz) : group.label;
  const href = `/arkusze/${group.arkuszId}`;
  const sourceBadge =
    sample && group.typ === "matura" ? arkuszMaturaBadge(sample) : null;
  return (
    <Link
      href={href}
      className="card-raised group flex min-h-[11rem] flex-col justify-between p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="icon-chip flex h-11 w-11 shrink-0 rounded-xl">
          <FileText className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full border border-surface-border bg-surface-hover px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted">
          {sourceBadge ?? TYP_EGZAMINU_LABELS[group.typ]}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-accent">
          {label}
        </h3>
        <p className="mt-2 text-sm text-muted">
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
  icon: Icon,
  yearFilter,
}: {
  title: string;
  subtitle: string;
  groups: CmsArkuszGroup[];
  icon: typeof GraduationCap;
  yearFilter: number | "all";
}) {
  const yearGroups = groupCmsTasksByYear(groups).filter(
    ({ year }) => yearFilter === "all" || year === yearFilter,
  );
  if (groups.length === 0 || yearGroups.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" aria-hidden />
        <div className="flex flex-col">
          <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 space-y-8">
        {yearGroups.map(({ year, groups: yearItems }) => (
          <div key={year}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Rok {year}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {yearItems.map((group) => (
                <CmsArkuszCard key={group.arkuszId} group={group} />
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
  cmsTasks: initialCmsTasks = [],
  schemaMissing: initialSchemaMissing = false,
  errorNote: initialErrorNote,
}: ArkuszeCkeCatalogProps) {
  const [cmsTasks, setCmsTasks] = useState(initialCmsTasks);
  const [cmsLoading, setCmsLoading] = useState(
    initialCmsTasks.length === 0 && isSupabaseConfigured(),
  );
  const [schemaMissing, setSchemaMissing] = useState(initialSchemaMissing);
  const [errorNote, setErrorNote] = useState<string | null>(
    initialErrorNote ?? null,
  );

  useEffect(() => {
    if (
      !isSupabaseConfigured() ||
      cmsTasks.length > 0 ||
      schemaMissing ||
      errorNote
    ) {
      return;
    }

    let cancelled = false;

    void fetchZadaniaCatalogSafe()
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          if (isSchemaMissingError(error)) {
            setSchemaMissing(true);
          } else {
            setErrorNote(formatSupabaseErrorForUser(error));
          }
          return;
        }

        setCmsTasks(data);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorNote(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać arkuszy.",
        );
      })
      .finally(() => {
        if (!cancelled) setCmsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cmsTasks.length, errorNote, schemaMissing]);

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
  const maturaSections = [
    { key: "p", label: "Matura podstawowa", rozszerzona: false },
    { key: "r", label: "Matura rozszerzona", rozszerzona: true },
  ]
    .map((section) => ({
      ...section,
      years: archiveByYear
        .map((entry) => ({
          ...entry,
          sheets: entry.sheets.filter(
            (sheet) =>
              officialCkeSheetKind(sheet) === "matura" &&
              /rozszerzon/i.test(sheet.title) === section.rozszerzona,
          ),
        }))
        .filter((entry) => entry.sheets.length > 0),
    }))
    .filter((section) => section.years.length > 0);
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
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Arkusze{" "}
          <span className="text-accent">CKE</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Interaktywne arkusze z rozwiązaniami krok po kroku.{" "}
          <Link
            href="/baza-zadan"
            className="font-semibold text-accent hover:text-foreground"
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
        <p className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground">
          {errorNote}
        </p>
      )}

      {hasArchive && archiveYears.length > 1 && (
        <div
          className="mt-6 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtruj arkusze po roku"
        >
          <span className="text-overline mr-1">Rok</span>
          <button
            type="button"
            aria-pressed={yearFilter === "all"}
            onClick={() => setYearFilter("all")}
            className={`filter-chip ${
              yearFilter === "all" ? "filter-chip-active" : ""
            }`}
          >
            Wszystkie
          </button>
          {archiveYears.map((year) => {
            const active = yearFilter === year;
            return (
              <button
                key={year}
                type="button"
                aria-pressed={active}
                onClick={() => setYearFilter(year)}
                className={`filter-chip ${active ? "filter-chip-active" : ""}`}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}

      {!hasArchive &&
        cmsLoading && (
          <p className="mt-10 text-sm text-muted">
            Ładowanie dodatkowych arkuszy…
          </p>
        )}

      {!hasArchive && e8Groups.length === 0 && extraCmsGroups.length === 0 && !schemaMissing && !cmsLoading && (
        <div className="mt-10 rounded-2xl border border-surface-border bg-surface p-8 text-center">
          <p className="text-lg font-extrabold text-foreground">Brak arkuszy</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Oficjalne sesje CKE powinny być w archiwum aplikacji. Sprawdź
            wdrożenie albo wróć do treningu tematycznego.
          </p>
        </div>
      )}

      {maturaSections.map((section) => (
        <section key={section.key} className="mt-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" aria-hidden />
            <div>
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
                {section.label} - oficjalne sesje CKE
              </h2>
              <p className="mt-1 text-sm text-muted">
                Od najnowszych sesji.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-8">
            {section.years.map(({ year, sheets }) => (
              <div key={year}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Rok {year}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => (
                    <ArchiveSheetCard key={sheet.id} sheet={sheet} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {archiveE8.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-accent" aria-hidden />
            <div>
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
                Egzamin ósmoklasisty
              </h2>
              <p className="mt-1 text-sm text-muted">
                Oficjalne arkusze CKE dla klasy 8.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-8">
            {archiveE8.map(({ year, sheets }) => (
              <div key={year}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Rok {year}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="mt-8 text-sm text-muted">
          Egzamin ósmoklasisty pojawi się tutaj po imporcie oficjalnych arkuszy
          CKE.
        </p>
      )}

      <CmsYearSection
        title="Egzamin ósmoklasisty"
        subtitle="Arkusze z bazy serwisu"
        groups={e8Groups}
        icon={School}
        yearFilter="all"
      />

      <CmsYearSection
        title="Dodatkowe arkusze"
        subtitle="Materiały spoza oficjalnego archiwum CKE"
        groups={extraCmsGroups}
        icon={GraduationCap}
        yearFilter="all"
      />
    </div>
  );
}
