"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LegalFooterLinks } from "@/components/legal/LegalFooterLinks";
import { useDesktopNav } from "@/components/useDesktopNav";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();
  const isDesktopNav = useDesktopNav();

  if (pathname === "/") return null;

  return (
    <footer className="mt-auto w-full border-t border-surface-border py-6">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted md:px-8">
        <p>© {new Date().getFullYear()} {SITE_NAME}</p>
        <div className="flex flex-wrap items-center gap-4">
          {isDesktopNav ? (
            <nav aria-label="Stopka" className="flex flex-wrap items-center gap-4">
              <Link
                href="/baza-zadan"
                className="text-muted transition-colors hover:text-foreground"
              >
                Baza zadań
              </Link>
            </nav>
          ) : null}
          <LegalFooterLinks className="flex flex-wrap items-center gap-4" />
        </div>
      </div>
    </footer>
  );
}
