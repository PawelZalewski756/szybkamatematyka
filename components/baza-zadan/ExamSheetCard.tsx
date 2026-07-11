import type { ExamSheet } from "@/lib/baza-zadan/types";
import { Clock } from "lucide-react";
import Link from "next/link";

type ExamSheetCardProps = {
  sheet: ExamSheet;
};

export function ExamSheetCard({ sheet }: ExamSheetCardProps) {
  return (
    <Link
      href={`/baza-zadan/arkusz/${sheet.id}`}
      className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#111820]/80 p-5 transition hover:border-accent/25 hover:bg-[#141c2b]"
    >
      <span className="text-2xl" aria-hidden>
        {sheet.emoji}
      </span>
      <h3 className="mt-3 text-base font-bold text-white group-hover:text-accent">
        {sheet.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">
        {sheet.description}
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {sheet.taskIds.length} zadań · {sheet.timeMinutes} min
      </p>
    </Link>
  );
}
