import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/info/InfoPageShell";
import {
  BRAND_DOMAIN,
  BRAND_NAME,
  CONTACT_EMAIL,
} from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Regulamin",
  description: `Regulamin serwisu ${BRAND_NAME} — zasady korzystania z platformy, konta i subskrypcji.`,
  alternates: { canonical: "/regulamin" },
};

export default function RegulaminPage() {
  return (
    <InfoPageShell
      title="Regulamin"
      description={`Zasady korzystania z serwisu ${BRAND_NAME} (${BRAND_DOMAIN}).`}
      updatedAt="27 października 2026"
    >
      <InfoSection title="1. Postanowienia ogólne">
        <p>
          Niniejszy regulamin określa zasady korzystania z platformy edukacyjnej{" "}
          {BRAND_NAME} dostępnej pod adresem {BRAND_DOMAIN} („Serwis”).
        </p>
        <p>
          Korzystając z Serwisu, akceptujesz warunki regulaminu. Jeśli się z
          nimi nie zgadzasz, nie korzystaj z platformy.
        </p>
      </InfoSection>

      <InfoSection title="2. Charakter usługi">
        <p>
          {BRAND_NAME} to narzędzie do nauki matematyki (m.in. matura i egzamin
          ósmoklasisty): materiały, zadania, arkusze, trening i funkcje
          dodatkowe (np. minigry, rankingi). Treści mają charakter edukacyjny i
          nie stanowią indywidualnej porady dydaktycznej ani gwarancji wyniku
          egzaminu.
        </p>
      </InfoSection>

      <InfoSection title="3. Konto użytkownika">
        <p>
          Część funkcji wymaga założenia konta. Podajesz prawdziwe dane
          potrzebne do rejestracji (w szczególności adres e-mail) i chronisz
          hasło. Jesteś odpowiedzialny za działania wykonane na Twoim koncie.
        </p>
        <p>
          Możesz usunąć konto, kontaktując się z nami — szczegóły w{" "}
          <Link href="/polityka-prywatnosci" className="font-semibold text-accent hover:underline">
            polityce prywatności
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection title="4. Plany i płatności">
        <p>
          Serwis oferuje plan darmowy oraz płatne plany (np. Pro, Roczny).
          Aktualny cennik znajdziesz na stronie{" "}
          <Link href="/cennik" className="font-semibold text-accent hover:underline">
            Cennik
          </Link>
          . Płatności obsługuje zewnętrzny operator (Stripe).
        </p>
        <p>
          Subskrypcję miesięczną możesz anulować w dowolnym momencie — dostęp
          trwa do końca opłaconego okresu. Plan roczny obowiązuje przez
          wykupiony okres, o ile przepisy konsumenckie nie stanowią inaczej.
        </p>
      </InfoSection>

      <InfoSection title="5. Zasady korzystania">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nie udostępniaj konta osobom trzecim.</li>
          <li>
            Nie kopiuj, nie odsprzedawaj i nie rozpowszechniaj treści Serwisu
            poza dozwolonym użytkiem prywatnym.
          </li>
          <li>
            Nie próbuj obchodzić limitów planu, zabezpieczeń ani systemów
            płatności.
          </li>
          <li>
            Nie publikuj treści obraźliwych, nielegalnych ani naruszających
            prawa innych osób (o ile Serwis umożliwia interakcje).
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="6. Własność intelektualna">
        <p>
          Materiały, układ, oprogramowanie i oznaczenia {BRAND_NAME} są
          chronione prawem. Arkusze i treści pochodzące od CKE lub innych
          podmiotów mogą podlegać ich własnym zasadom wykorzystania — używamy
          ich w celach edukacyjnych w ramach Serwisu.
        </p>
      </InfoSection>

      <InfoSection title="7. Odpowiedzialność">
        <p>
          Dokładamy starań, by treści były poprawne, ale nie gwarantujemy
          nieprzerwanej dostępności Serwisu ani braku błędów w treściach.
          Odpowiedzialność za decyzje edukacyjne i wyniki egzaminów spoczywa na
          użytkowniku (lub opiekunie prawnym).
        </p>
        <p>
          W zakresie dozwolonym prawem odpowiedzialność Serwisu ogranicza się do
          kwoty faktycznie zapłaconej za usługę w okresie, którego dotyczy
          roszczenie.
        </p>
      </InfoSection>

      <InfoSection title="8. Zmiany regulaminu">
        <p>
          Możemy aktualizować regulamin. Nowa wersja obowiązuje od publikacji na
          tej stronie, chyba że wskazano inny termin. O istotnych zmianach
          poinformujemy w Serwisie lub e-mailem, gdy to możliwe.
        </p>
      </InfoSection>

      <InfoSection title="9. Kontakt">
        <p>
          Pytania dotyczące regulaminu:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
