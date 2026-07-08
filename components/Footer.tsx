"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDesktopNav } from "@/components/useDesktopNav";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();
  const isDesktopNav = useDesktopNav();

  if (pathname === "/" || !isDesktopNav) return null;

  return (
    <footer className="mt-auto w-full border-t border-surface-border py-6">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted md:px-8">
        <p>© {new Date().getFullYear()} {SITE_NAME}</p>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/baza-zadan"
            className="text-muted transition-colors hover:text-foreground"
          >
            Baza zadań
          </Link>
          <Link
            href="/admin"
            className="text-muted transition-colors hover:text-foreground"
          >
            Panel Admina
          </Link>
          <Link
            href="/admin/materialy"
            className="text-muted transition-colors hover:text-foreground"
          >
            Materiały
          </Link>
        </nav>
      </div>
    </footer>
  );
}
