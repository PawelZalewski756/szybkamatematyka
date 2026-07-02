"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  PATH_OPTIONS,
  type LearningPath,
} from "@/lib/learning-path";

type NavbarPathSelectProps = {
  className?: string;
};

export function NavbarPathSelect({ className = "" }: NavbarPathSelectProps) {
  const { path, setPath } = useLearningPath();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPath(e.target.value as LearningPath);
  };

  return (
    <label
      className={`flex min-w-0 flex-col gap-0.5 ${className}`}
      aria-label="Szkoła podstawowa lub średnia"
    >
      <select
        value={path}
        onChange={handleChange}
        className="w-full min-w-0 cursor-pointer truncate rounded-lg border border-white/10 bg-[#111820] py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-200 outline-none transition-colors hover:border-white/20 focus:border-teal-500/40 lg:text-sm lg:py-2"
      >
        {PATH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
