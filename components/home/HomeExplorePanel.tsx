import { HOME_EXPLORE_GROUPS } from "@/lib/layout/home-explore";
import Link from "next/link";

type HomeExplorePanelProps = {
  compact?: boolean;
};

export function HomeExplorePanel({ compact = false }: HomeExplorePanelProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted">Więcej na platformie</h2>

      <div className={compact ? "mt-4 space-y-6" : "mt-5 space-y-6"}>
        {HOME_EXPLORE_GROUPS.map((group) => (
          <div key={group.label ?? "misc"}>
            {group.label && (
              <p className="mb-2 text-xs font-medium text-muted">{group.label}</p>
            )}
            <ul className="divide-y divide-surface-border border-y border-surface-border">
              {group.links.map(({ href, label, hint }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group flex items-baseline justify-between gap-4 transition hover:bg-surface-hover ${
                      compact ? "px-1 py-3.5" : "px-1 py-3"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{hint}</span>
                    </span>
                    <span className="shrink-0 text-sm text-muted transition group-hover:text-foreground">
                      →
                    </span>
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
