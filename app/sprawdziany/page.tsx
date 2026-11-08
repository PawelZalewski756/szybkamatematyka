import { SheetView } from "@/components/sprawdziany/SheetView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sprawdziany z matematyki — arkusze jak na klasówce",
  description:
    "Sprawdziany z matematyki dla klas 6–8: arkusze działowe z punktacją, grupami A i B, rysunkami, kluczem odpowiedzi i skalą ocen.",
  alternates: { canonical: "/sprawdziany" },
};

export default function SprawdzianyPage() {
  return <SheetView />;
}