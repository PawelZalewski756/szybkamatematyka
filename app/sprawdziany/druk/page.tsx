import { PrintSheet } from "@/components/sprawdziany/PrintSheet";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sprawdzian do druku (PDF)",
  robots: { index: false, follow: false },
};

export default function DrukPage() {
  return (
    <Suspense fallback={null}>
      <PrintSheet />
    </Suspense>
  );
}