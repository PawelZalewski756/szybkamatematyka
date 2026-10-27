import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

import { CONTACT_EMAIL } from "@/lib/brand/constants";
import {
  FOOTER_INFO_LINKS,
  FOOTER_PRODUCT_LINKS,
} from "@/lib/layout/footer-links";

export function HomeGamingFooter() {
  return (
    <footer className="border-t border-surface-border pt-10 pb-6">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BrandLogo asLink={false} className="justify-start" />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Nauka matematyki do matury i egzaminu ósmoklasisty: teoria, zadania
            z rozwiązaniami i arkusze CKE.
          </p>
          <p className="mt-3 text-sm text-muted">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-3 text-xs text-muted">
            © {new Date().getFullYear()} Szybka Matematyka · szybkamatematyka.pl
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8 text-sm sm:text-right">
          <nav aria-label="Stopka — serwis" className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/70 sm:text-right">
              Serwis
            </p>
            {FOOTER_PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Stopka — informacje" className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/70 sm:text-right">
              Informacje
            </p>
            {FOOTER_INFO_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
