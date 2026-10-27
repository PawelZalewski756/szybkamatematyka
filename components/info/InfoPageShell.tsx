import Link from "next/link";
import type { ReactNode } from "react";

import { InfoTabs } from "@/components/info/InfoTabs";

type InfoPageShellProps = {
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
};

export function InfoPageShell({
  title,
  description,
  updatedAt,
  children,
}: InfoPageShellProps) {
  return (
    <div className="page-prose flex flex-1 flex-col py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Strona główna
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
        {updatedAt ? (
          <p className="mt-2 text-xs text-muted">
            Ostatnia aktualizacja: {updatedAt}
          </p>
        ) : null}
      </header>

      <InfoTabs />

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
        {children}
      </div>
    </div>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
