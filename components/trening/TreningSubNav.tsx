"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/trening", label: "Tematy" },
  { href: "/trening/arkusze", label: "Arkusze CKE" },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/trening") {
    return (
      pathname === "/trening" ||
      (pathname.startsWith("/trening/") &&
        !pathname.startsWith("/trening/arkusze"))
    );
  }
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    pathname.startsWith("/arkusze")
  );
}

export function TreningSubNav() {
  const pathname = usePathname();

  const show =
    pathname === "/trening" ||
    pathname === "/trening/arkusze" ||
    pathname.startsWith("/arkusze/");

  if (!show) return null;

  return (
    <div className="page-container relative z-20 pt-4 sm:pt-6">
      <nav
        aria-label="Sekcje treningu"
        className="mx-auto flex w-full max-w-lg rounded-lg border border-surface-border bg-surface p-1"
      >
        {TABS.map(({ href, label }) => {
          const active = isTabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-semibold transition sm:text-sm ${
                active
                  ? "bg-background text-brand"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
