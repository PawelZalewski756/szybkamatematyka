import { HOME_EXPLORE_GROUPS } from "@/lib/layout/home-explore";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type HomeExplorePanelProps = {
  /** Większe odstępy pod mobile. */
  compact?: boolean;
};

export function HomeExplorePanel({ compact = false }: HomeExplorePanelProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        Więcej na platformie
      </p>

      <div className={compact ? "mt-4 space-y-5" : "mt-3 space-y-4"}>
        {HOME_EXPLORE_GROUPS.map((group) => (
          <div key={group.label ?? "misc"}>
            {group.label && (
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.links.map(({ href, label, hint }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group flex items-start gap-2 rounded-lg transition hover:bg-white/[0.04] ${
                      compact ? "px-3 py-3" : "px-3 py-2"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate-300 group-hover:text-teal-300">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                        {hint}
                      </span>
                    </span>
                    <ChevronRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-700 transition group-hover:text-teal-500/70"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
