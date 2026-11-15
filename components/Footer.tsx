"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BugReportSection } from "@/components/feedback/BugReportSection";
import { CONTACT_EMAIL } from "@/lib/brand/constants";
import { FOOTER_INFO_LINKS } from "@/lib/layout/footer-links";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="mt-auto w-full border-t border-surface-border pb-[calc(4rem+env(safe-area-inset-bottom,0px))] pt-6 lg:pb-6">
      <div className="mx-auto w-full max-w-[1920px] px-4 md:px-8">
        <div className="flex flex-col gap-4 text-xs text-muted lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {SITE_NAME}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-foreground"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav
            aria-label="Stopka"
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            {FOOTER_INFO_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-5 border-t border-surface-border pt-4">
          <BugReportSection />
        </div>
      </div>
    </footer>
  );
}
