import { AdminPageClient } from "@/app/admin/AdminPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel administratora",
  // Panel wewnętrzny — nigdy nie indeksujemy.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageClient />;
}
