"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { SCHOOL_LEVEL_OPTIONS } from "@/lib/learning-path";

type SchoolLevelToggleProps = {
  className?: string;
  labelledBy?: string;
};

/**
 * Przełącznik poziomu nauki (szkoła podstawowa / szkoła średnia).
 * Wybór działa też bez logowania - zapisuje się lokalnie w przeglądarce.
 */
export function SchoolLevelToggle({
  className = "",
  labelledBy,
}: SchoolLevelToggleProps) {
  const { path, setPath } = useLearningPath();

  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : "Poziom nauki"}
      aria-labelledby={labelledBy}
      className={`inline-flex items-center gap-0.5 rounded-lg border border-surface-border bg-surface p-0.5 ${className}`}
    >
      {SCHOOL_LEVEL_OPTIONS.map((option) => {
        const active = option.value === path;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setPath(option.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
              active
                ? "bg-accent text-on-accent"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
