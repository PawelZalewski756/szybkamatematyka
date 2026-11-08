"use client";

import { CmsTaskCard } from "@/components/baza-zadan/CmsTaskCard";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import {
  arkuszMaturaBadge,
  groupCmsTasksByYear,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type CmsArkuszSectionProps = {
  title: string;
  subtitle: string;
  groups: CmsArkuszGroup[];
  /** Nagłówki lat - arkusze CKE po roku sesji. */
  groupByYear?: boolean;
};

function renderArkuszGroup(
  group: CmsArkuszGroup,
  openIds: Set<string>,
  toggle: (id: string) => void,
  borderAccent: string,
) {
  const isOpen = openIds.has(group.arkuszId);
  const sample = group.tasks[0];
  const arkuszEmbed = sample?.arkusz;
  const label = arkuszEmbed ? formatArkuszLabel(arkuszEmbed) : group.label;

  return (
    <div
      key={group.arkuszId}
      id={`arkusz-${group.arkuszId}`}
      className={`scroll-mt-24 overflow-hidden rounded-3xl border ${borderAccent}`}
    >
      <button
        type="button"
        onClick={() => toggle(group.arkuszId)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            {TYP_EGZAMINU_LABELS[group.typ]}
          </p>
          <p className="mt-1 text-base font-black text-foreground">{label}</p>
          <p className="mt-0.5 text-sm text-muted">
            {group.tasks.length} zadań
            {sample
              ? ` · ${arkuszMaturaBadge(sample) || "arkusz egzaminacyjny"}`
              : ""}
          </p>
        </div>
        <span
          className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 border-t border-surface-border px-4 pb-4 pt-2"
        >
          {group.tasks.map((z) => (
            <CmsTaskCard key={z.id} zadanie={z} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function CmsArkuszSection({
  title,
  subtitle,
  groups,
  groupByYear = false,
}: CmsArkuszSectionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const yearGroups = useMemo(
    () => (groupByYear ? groupCmsTasksByYear(groups) : null),
    [groupByYear, groups],
  );

  if (groups.length === 0) return null;

  const borderAccent = "border-accent/30 bg-accent/5";

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showHeader = title.length > 0 || subtitle.length > 0;

  return (
    <section>
      {showHeader && (
        <>
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </>
      )}

      <div className={showHeader ? "mt-4 space-y-6" : "space-y-6"}>
        {yearGroups
          ? yearGroups.map(({ year, groups: yearItems }) => (
              <motion.div key={year} className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted">
                  Rok {year}
                </h3>
                {yearItems.map((group) =>
                  renderArkuszGroup(group, openIds, toggle, borderAccent),
                )}
              </motion.div>
            ))
          : groups.map((group) =>
              renderArkuszGroup(group, openIds, toggle, borderAccent),
            )}
      </div>
    </section>
  );
}
