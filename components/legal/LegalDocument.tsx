import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_NAV, LEGAL_UPDATED } from "@/lib/legal/constants";

export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="page-container w-full max-w-3xl py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Dokument z {LEGAL_UPDATED}
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
        {children}
      </div>
      <nav aria-label="Dokumenty prawne" className="mt-12 flex flex-wrap gap-4 text-sm">
        {LEGAL_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="link-plain">
            {item.label}
          </Link>
        ))}
      </nav>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2 id={`${id}-heading`} className="text-xl font-bold text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </section>
  );
}
