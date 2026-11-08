import { AnalitykaPageClient } from "@/app/admin/analityka/AnalitykaPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analityka platformy",
  // Panel wewnętrzny - nigdy nie indeksujemy.
  robots: { index: false, follow: false },
};

export default function AdminAnalitykaPage() {
  return <AnalitykaPageClient />;
}
