"use client";

import {
  isLearningPath,
  SCHOOL_LEVEL_OPTIONS,
  type LearningPath,
} from "@/lib/learning-path";

type SchoolClassPickerProps = {
  value: LearningPath | "";
  onChange: (value: LearningPath | "") => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  optional?: boolean;
};

export function SchoolClassPicker({
  value,
  onChange,
  id = "school-class",
  className = "",
  disabled = false,
  optional = false,
}: SchoolClassPickerProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="sr-only">Poziom nauki</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const next = e.currentTarget.value;
          onChange(isLearningPath(next) ? next : "");
        }}
        className="input-field w-full cursor-pointer truncate py-1.5 pl-2.5 pr-7 text-xs font-medium lg:py-2 lg:text-sm"
      >
        {optional ? <option value="">Wybiorę później</option> : null}
        {SCHOOL_LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
