"use client";

import {
  SCHOOL_CLASS_GROUPS,
  type SchoolClassPath,
} from "@/lib/learning-path";

type SchoolClassPickerProps = {
  value: SchoolClassPath;
  onChange: (value: SchoolClassPath) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function SchoolClassPicker({
  value,
  onChange,
  id = "school-class",
  className = "",
  disabled = false,
}: SchoolClassPickerProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="sr-only">Twoja klasa</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as SchoolClassPath)}
        className="input-field w-full cursor-pointer truncate py-1.5 pl-2.5 pr-7 text-xs font-medium lg:py-2 lg:text-sm"
      >
        {SCHOOL_CLASS_GROUPS.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
