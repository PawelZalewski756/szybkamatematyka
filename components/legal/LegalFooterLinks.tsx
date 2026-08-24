import Link from "next/link";
import { LEGAL_NAV } from "@/lib/legal/constants";

export function LegalFooterLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Informacje prawne" className={className}>
      {LEGAL_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-muted transition-colors hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
