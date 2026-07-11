"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  schoolClassLabel,
  schoolClassShortLabel,
} from "@/lib/learning-path";
import Link from "next/link";

type NavbarClassBadgeProps = {
  className?: string;
  /** Gdy true — link do profilu (zalogowani). Goście widzą sam badge. */
  linkToProfile?: boolean;
};

export function NavbarClassBadge({
  className = "",
  linkToProfile = false,
}: NavbarClassBadgeProps) {
  const { schoolClass } = useLearningPath();
  const short = schoolClassShortLabel(schoolClass);
  const full = schoolClassLabel(schoolClass);

  const badge = (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1.5 text-xs font-bold text-accent lg:text-sm ${className}`}
      title={full}
    >
      {short}
    </span>
  );

  if (linkToProfile) {
    return (
      <Link
        href="/profil#klasa"
        className="min-w-0 shrink-0 transition hover:opacity-90"
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
