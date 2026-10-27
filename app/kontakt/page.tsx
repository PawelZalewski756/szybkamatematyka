import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/info/InfoPageShell";
import {
  BRAND_DOMAIN,
  BRAND_NAME,
  CONTACT_EMAIL,
} from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Skontaktuj się z zespołem ${BRAND_NAME} — pytania o konto, subskrypcję i treści.`,
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <InfoPageShell
      title="Kontakt"
      description={`Napisz do nas w sprawie konta, płatności lub treści na ${BRAND_DOMAIN}.`}
    >
      <InfoSection title="E-mail">
        <p>
          Najszybciej odpowiemy na wiadomość na adres:
        </p>
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex text-lg font-bold text-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-muted">
          Zwykle odpisujemy w ciągu 1–2 dni roboczych.
        </p>
      </InfoSection>

      <InfoSection title="W czym możemy pomóc">
        <ul className="list-disc space-y-1 pl-5">
          <li>problemy z logowaniem lub kontem,</li>
          <li>subskrypcja Pro / Roczny i faktury,</li>
          <li>zgłoszenia błędów w treściach lub zadaniach,</li>
          <li>pytania o regulamin i prywatność.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Przydatne linki">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/cennik" className="font-semibold text-accent hover:underline">
              Cennik
            </Link>
          </li>
          <li>
            <Link href="/regulamin" className="font-semibold text-accent hover:underline">
              Regulamin
            </Link>
          </li>
          <li>
            <Link
              href="/polityka-prywatnosci"
              className="font-semibold text-accent hover:underline"
            >
              Polityka prywatności
            </Link>
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="O serwisie">
        <p>
          {BRAND_NAME} to platforma do nauki matematyki pod maturę i egzamin
          ósmoklasisty — trening, baza zadań, arkusze CKE i minigry.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
