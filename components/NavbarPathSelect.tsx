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
        className="input-field w-full cursor-pointer truncate py-1.5 pl-2.5 pr-7 text-xs font-medium lg:py-2 lg:text-sm"
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
