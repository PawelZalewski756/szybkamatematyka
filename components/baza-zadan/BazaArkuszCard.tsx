import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import {
  arkuszMaturaBadge,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import Link from "next/link";

export function BazaArkuszCard({ group }: { group: CmsArkuszGroup }) {
  const sample = group.tasks[0];
  const arkusz = sample?.arkusz;
  const label = arkusz ? formatArkuszLabel(arkusz) : group.label;
  const badge =
    sample && group.typ === "matura"
      ? arkuszMaturaBadge(sample)
      : TYP_EGZAMINU_LABELS[group.typ];

  return (
    <Link
      href={`/arkusze/${group.arkuszId}`}
      className="group flex flex-col rounded-xl border border-surface-border bg-surface px-4 py-3.5 transition hover:border-accent/30 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-accent">
          {label}
        </h3>
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">
          {badge}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {group.tasks.length} zadań · z rozwiązaniami
      </p>
    </Link>
  );
}
