"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CONTACT_EMAIL } from "@/lib/brand/constants";
import { FOOTER_INFO_LINKS } from "@/lib/layout/footer-links";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="mt-auto w-full border-t border-surface-border py-6">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-4 text-xs text-muted md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex min-h-8 items-center transition-colors hover:text-foreground"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap items-center gap-x-4 gap-y-0"
        >
          {FOOTER_INFO_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-8 items-center text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
