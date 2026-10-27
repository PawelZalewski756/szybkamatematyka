"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FOOTER_INFO_LINKS } from "@/lib/layout/footer-links";

export function InfoTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Strony informacyjne"
      className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-b border-surface-border pb-4 text-sm"
    >
      {FOOTER_INFO_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "font-semibold text-accent"
                : "font-medium text-muted transition-colors hover:text-accent"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
