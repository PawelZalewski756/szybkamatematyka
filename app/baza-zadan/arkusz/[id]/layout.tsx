import { getClientExamSheetById } from "@/lib/baza-zadan/client-catalog";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

/**
 * Strona arkusza (`page.tsx`) jest komponentem klienckim (interaktywny solver),
 * więc metadata dostarczamy z serwerowego layoutu — ma dostęp do tych samych
 * parametrów trasy i może je zbudować na bazie treści arkusza.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sheet = getClientExamSheetById(id);

  if (!sheet) {
    return {
      title: "Arkusz treningowy",
      description: "Arkusz treningowy z zadaniami z matematyki.",
    };
  }

  return {
    title: sheet.title,
    description: `${sheet.description} Rozwiąż arkusz online, sprawdzaj odpowiedzi i przygotuj się do egzaminu.`,
    alternates: { canonical: `/baza-zadan/arkusz/${sheet.id}` },
  };
}

export default function ArkuszLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
