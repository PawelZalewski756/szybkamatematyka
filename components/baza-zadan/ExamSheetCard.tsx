import type { ExamSheet } from "@/lib/baza-zadan/types";
import Link from "next/link";

type ExamSheetCardProps = {
  sheet: ExamSheet;
};

export function ExamSheetCard({ sheet }: ExamSheetCardProps) {
  return (
    <Link
      href={`/baza-zadan/arkusz/${sheet.id}`}
      className={`group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${sheet.gradient} p-6 shadow-lg transition-transform hover:scale-[1.02]`}
    >
      <span className="text-4xl">{sheet.emoji}</span>
      <div>
        <h3 className="text-xl font-black text-white">{sheet.title}</h3>
        <p className="mt-2 text-sm text-white/80">{sheet.description}</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/70">
          {sheet.taskIds.length} zadań · {sheet.timeMinutes} min
        </p>
      </div>
    </Link>
  );
}
