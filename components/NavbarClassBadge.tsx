"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  learningPathLabel,
  learningPathShortLabel,
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
  const { path, hasPathSelection } = useLearningPath();
  if (!hasPathSelection) return null;

  const short = learningPathShortLabel(path);
  const full = learningPathLabel(path);

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
        aria-label={`Poziom nauki: ${full}. Zmień w profilu.`}
      >
        {badge}
      </Link>
    );
  }

  return (
    <span
      className={`min-w-0 shrink-0 ${className}`}
      aria-label={`Poziom nauki: ${full}`}
    >
      {badge}
    </span>
  );
}
