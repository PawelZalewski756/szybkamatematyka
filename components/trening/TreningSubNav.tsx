"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/trening", label: "Trening" },
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
    pathname.startsWith("/trening/arkusze/") ||
    pathname.startsWith("/arkusze/");

  if (!show) return null;

  return (
    <div className="page-container pt-4 sm:pt-6">
      <nav
        aria-label="Sekcje treningu"
        className="flex gap-6 border-b border-surface-border text-sm"
      >
        {TABS.map(({ href, label }) => {
          const active = isTabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 pb-2 transition ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
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
