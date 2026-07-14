"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  schoolClassLabel,
  schoolClassShortLabel,
} from "@/lib/learning-path";
import Link from "next/link";

type NavbarClassBadgeProps = {
  className?: string;
  linkToProfile?: boolean;
  inline?: boolean;
};

export function NavbarClassBadge({
  className = "",
  linkToProfile = false,
  inline = false,
}: NavbarClassBadgeProps) {
  const { schoolClass } = useLearningPath();
  const short = schoolClassShortLabel(schoolClass);
  const full = schoolClassLabel(schoolClass);

  const badge = (
    <span
      className={
        inline
          ? `inline-flex max-w-full shrink-0 items-center truncate px-2.5 py-1 text-[11px] font-bold text-accent ${className}`
          : `inline-flex max-w-full shrink-0 items-center truncate rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent ${className}`
      }
      title={full}
    >
      {short}
    </span>
  );

  if (linkToProfile) {
    return (
      <Link
        href="/profil#klasa"
        className="min-w-0 shrink-0 rounded-full transition hover:bg-accent/10"
        aria-label={`Twoja klasa: ${full}. Zmień w profilu.`}
      >
        {badge}
      </Link>
    );
  }

  return (
    <span
      className={`min-w-0 shrink-0 ${className}`}
      aria-label={`Twoja klasa: ${full}`}
    >
      {badge}
    </span>
  );
}
