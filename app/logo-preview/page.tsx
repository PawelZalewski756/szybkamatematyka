import {
  LogoPreviewContent,
  LogoPreviewHeader,
} from "@/components/brand/LogoPreviewContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Propozycje logo",
  robots: { index: false, follow: false },
};

export default function LogoPreviewPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <LogoPreviewHeader />
      <LogoPreviewContent />
    </div>
  );
}
