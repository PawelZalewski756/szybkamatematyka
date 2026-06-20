import { MaterialyPageClient } from "@/app/admin/materialy/MaterialyPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materiały teoretyczne",
  // Panel wewnętrzny — nigdy nie indeksujemy.
  robots: { index: false, follow: false },
};

export default function AdminMaterialyPage() {
  return <MaterialyPageClient />;
}
