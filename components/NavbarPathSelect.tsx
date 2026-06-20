"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  learningPathShortLabel,
  PATH_OPTIONS,
  type LearningPath,
} from "@/lib/learning-path";

type NavbarPathSelectProps = {
  className?: string;
};

export function NavbarPathSelect({ className = "" }: NavbarPathSelectProps) {
  const { path, setPath, ready } = useLearningPath();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPath(e.target.value as LearningPath);
  };

  return (
    <label
      className={`flex min-w-0 flex-col gap-0.5 ${className}`}
      aria-label="Szkoła podstawowa lub średnia"
    >
      <span className="hidden text-[10px] font-bold uppercase tracking-widest text-zinc-500 sm:block">
        Twoja ścieżka
      </span>
      <select
        value={path}
        onChange={handleChange}
        disabled={!ready}
        className="w-full min-w-0 cursor-pointer truncate rounded-xl border border-violet-500/30 bg-zinc-900/90 py-2 pl-2.5 pr-7 text-xs font-bold text-white shadow-inner shadow-violet-500/5 outline-none transition-colors hover:border-fuchsia-500/40 focus:border-fuchsia-500/60 focus:ring-2 focus:ring-fuchsia-500/25 disabled:opacity-50 sm:max-w-[13.5rem] sm:py-2.5 sm:pl-3 sm:text-sm"
        title={ready ? undefined : "Ładowanie…"}
      >
        {PATH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="truncate text-[10px] font-semibold text-fuchsia-400/90 sm:hidden">
        {ready ? learningPathShortLabel(path) : "…"}
      </span>
    </label>
  );
}
