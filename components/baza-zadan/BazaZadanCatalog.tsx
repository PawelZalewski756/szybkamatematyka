"use client";

import {
  CatalogFilters,
  type CatalogFilterState,
} from "@/components/baza-zadan/CatalogFilters";
import {
  CatalogSectionNav,
  type CatalogSectionId,
} from "@/components/baza-zadan/CatalogSectionNav";
import { CmsArkuszSection } from "@/components/baza-zadan/CmsArkuszSection";
import { ExamSheetsGrouped } from "@/components/baza-zadan/ExamSheetsGrouped";
import { TaskSectionBlock } from "@/components/baza-zadan/TaskSectionBlock";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getAllTasks,
  getExamSheetsGrouped,
  getTasksGroupedBySection,
} from "@/lib/baza-zadan/catalog";
import {
  isCkeMaturaArkusz,
  splitCmsTasks,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { learningPathLabel } from "@/lib/learning-path";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type BazaZadanCatalogProps = {
  cmsTasks?: ZadanieWithArkusz[];
};

const DEFAULT_FILTERS: CatalogFilterState = {
  category: "all",
  difficulty: "all",
  search: "",
};

function CollapsibleBlock({
  id,
  title,
  subtitle,
  countLabel,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  countLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-28">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-lg font-black text-white">{title}</h2>
          <p className="text-sm text-zinc-400">
            {countLabel ?? subtitle}
          </p>
        </div>
        <span
          className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function defaultCatalogSection(cmsTasks: ZadanieWithArkusz[]): CatalogSectionId {
  if (cmsTasks.some(isCkeMaturaArkusz)) return "cke-matura";
  return "dzialy";
}

export function BazaZadanCatalog({ cmsTasks = [] }: BazaZadanCatalogProps) {
  const { path } = useLearningPath();
  const [filters, setFilters] = useState<CatalogFilterState>(DEFAULT_FILTERS);
  const [activeSection, setActiveSection] = useState<CatalogSectionId>(() =>
    defaultCatalogSection(cmsTasks),
  );

  const totalInApp = getAllTasks().length;

  const sheetGroups = useMemo(() => getExamSheetsGrouped(path), [path]);

  const sheetCount = useMemo(
    () => sheetGroups.reduce((n, g) => n + g.sheets.length, 0),
    [sheetGroups],
  );

  const sections = useMemo(
    () =>
      getTasksGroupedBySection(path, {
        category: filters.category,
        difficulty: filters.difficulty,
        search: filters.search,
      }),
    [path, filters],
  );

  const filteredTaskCount = useMemo(
    () => sections.reduce((n, s) => n + s.tasks.length, 0),
    [sections],
  );

  const pathLabel = learningPathLabel(path);

  const { ckeGroups, otherGroups } = useMemo(
    () => splitCmsTasks(cmsTasks),
    [cmsTasks],
  );

  const cmsE8Groups = useMemo(
    () => otherGroups.filter((g) => g.typ === "egzamin-8"),
    [otherGroups],
  );

  const cmsAdminGroups = useMemo(
    () => otherGroups.filter((g) => g.typ !== "egzamin-8"),
    [otherGroups],
  );

  const ckeMaturaCount = useMemo(
    () => ckeGroups.reduce((n, g) => n + g.tasks.length, 0),
    [ckeGroups],
  );

  const ckeE8Count = useMemo(
    () => cmsE8Groups.reduce((n, g) => n + g.tasks.length, 0),
    [cmsE8Groups],
  );

  const adminCount = useMemo(
    () => cmsAdminGroups.reduce((n, g) => n + g.tasks.length, 0),
    [cmsAdminGroups],
  );

  useEffect(() => {
    const id = defaultCatalogSection(cmsTasks);
    if (id === "dzialy") return;
    const el = document.getElementById(`catalog-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [cmsTasks]);

  const navItems = useMemo(() => {
    const items: {
      id: CatalogSectionId;
      label: string;
      count?: number;
    }[] = [
      {
        id: "dzialy",
        label: "Po działach",
        count: filteredTaskCount,
      },
    ];
    if (ckeMaturaCount > 0) {
      items.push({
        id: "cke-matura",
        label: "Matura CKE",
        count: ckeMaturaCount,
      });
    }
    if (ckeE8Count > 0) {
      items.push({
        id: "cke-e8",
        label: "Egzamin 8-kl. CKE",
        count: ckeE8Count,
      });
    }
    items.push({
      id: "arkusze",
      label: "Arkusze treningowe",
      count: sheetCount,
    });
    if (adminCount > 0) {
      items.push({
        id: "admin",
        label: "Panel admin",
        count: adminCount,
      });
    }
    return items;
  }, [
    filteredTaskCount,
    sheetCount,
    ckeMaturaCount,
    ckeE8Count,
    adminCount,
  ]);

  return (
    <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="flex w-full flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <CatalogFilters
          filters={filters}
          onChange={setFilters}
          taskCount={filteredTaskCount}
          sheetCount={sheetCount}
        />
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 backdrop-blur">
          <span className="font-bold text-white">{totalInApp}</span> zadań w
          bazie aplikacji dla ścieżki{" "}
          <span className="font-semibold text-cyan-300">{pathLabel}</span>
          {ckeMaturaCount + ckeE8Count > 0 && (
            <>
              {" "}
              +{" "}
              <span className="font-bold text-emerald-300">
                {ckeMaturaCount + ckeE8Count}
              </span>{" "}
              z arkuszy CKE
            </>
          )}
          {adminCount > 0 && (
            <>
              {" "}
              +{" "}
              <span className="font-bold text-violet-300">{adminCount}</span>{" "}
              z panelu admin
            </>
          )}
          . Oficjalne arkusze CKE są w sekcji „Matura CKE”; treningowe — niżej,
          zwinięte.
        </p>

        <CatalogSectionNav
          items={navItems}
          active={activeSection}
          onSelect={setActiveSection}
        />

        <section id="catalog-dzialy" className="scroll-mt-28 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">
              Przeglądaj po działach
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Tematy z liczbą zadań — filtry z paska bocznego działają tutaj.
            </p>
          </div>
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <TaskSectionBlock
                  section={section}
                  defaultOpen={index < 2}
                  previewLimit={null}
                />
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15">
              <EmptyState
                icon={SearchX}
                title="Brak zadań dla wybranych filtrów"
                description="Zmień dział, typ egzaminu lub wyszukiwaną frazę, aby zobaczyć więcej zadań."
              />
            </div>
          )}
        </section>

        {ckeGroups.length > 0 && (
          <CollapsibleBlock
            id="catalog-cke-matura"
            title="Matura podstawowa — arkusze CKE"
            subtitle="Oficjalne sesje — pogrupowane po roku"
            countLabel={`${ckeMaturaCount} zadań · ${ckeGroups.length} arkuszy`}
            defaultOpen={ckeMaturaCount > 0}
          >
            <CmsArkuszSection
              title=""
              subtitle=""
              groups={ckeGroups}
              accent="emerald"
              groupByYear
            />
          </CollapsibleBlock>
        )}

        {cmsE8Groups.length > 0 && (
          <CollapsibleBlock
            id="catalog-cke-e8"
            title="Egzamin 8-klasisty — arkusze"
            subtitle="Oficjalne i importowane arkusze ósmoklasisty"
            countLabel={`${ckeE8Count} zadań · ${cmsE8Groups.length} arkuszy`}
            defaultOpen={false}
          >
            <CmsArkuszSection
              title=""
              subtitle=""
              groups={cmsE8Groups}
              accent="emerald"
              groupByYear
            />
          </CollapsibleBlock>
        )}

        {cmsAdminGroups.length > 0 && (
          <CollapsibleBlock
            id="catalog-admin"
            title="Twoje arkusze (Supabase)"
            subtitle="Zadania dodane ręcznie w /admin"
            countLabel={`${adminCount} zadań`}
            defaultOpen={false}
          >
            <CmsArkuszSection
              title=""
              subtitle=""
              groups={cmsAdminGroups}
              accent="violet"
            />
          </CollapsibleBlock>
        )}

        <CollapsibleBlock
          id="catalog-arkusze"
          title="Arkusze treningowe"
          subtitle="Matura, Egzamin 8-klasisty i sprint podstawówki — w aplikacji"
          countLabel={`${sheetCount} arkuszy — rozwijaj typ egzaminu`}
          defaultOpen={false}
        >
          {sheetGroups.length > 0 ? (
            <ExamSheetsGrouped
              groups={sheetGroups}
              defaultOpenKinds={new Set()}
            />
          ) : (
            <p className="text-zinc-500">
              Brak arkuszy dla tej ścieżki — zmień klasę w pasku u góry.
            </p>
          )}
        </CollapsibleBlock>
      </div>
    </div>
  );
}
