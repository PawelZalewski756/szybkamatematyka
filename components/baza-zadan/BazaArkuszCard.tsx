import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import {
  arkuszMaturaBadge,
  type CmsArkuszGroup,
} from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import { FileText } from "lucide-react";
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
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#111820]/80 p-5 transition hover:border-accent/25 hover:bg-[#141c2b]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
          <FileText className="h-5 w-5" aria-hidden />
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {badge}
        </span>
      </div>
      <h3 className="mt-4 text-base font-bold leading-snug text-white group-hover:text-accent">
        {label}
      </h3>
      <p className="mt-1.5 text-sm text-slate-500">
        {group.tasks.length} zadań · rozwiązania krok po kroku
      </p>
    </Link>
  );
}
