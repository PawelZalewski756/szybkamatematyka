import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { LEGAL_DOMAIN, LEGAL_OPERATOR, LEGAL_SITE } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Regulamin",
  description:
    "Regulamin serwisu Szybka Matematyka: zasady korzystania, konto, treści CKE i płatności.",
  alternates: { canonical: "/regulamin" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalDocument title="Regulamin serwisu">
      <p>
        Korzystając z {LEGAL_SITE}, zawierasz umowę o świadczenie usług drogą
        elektroniczną z operatorem {LEGAL_OPERATOR} ({LEGAL_DOMAIN}). Jeśli się
        nie zgadzasz, nie zakładaj konta i nie używaj płatnych funkcji.
      </p>

      <LegalSection id="usluga" title="1. Co oferuje serwis">
        <p>
          Platforma do nauki matematyki: trening tematyczny, baza zadań,
          arkusze (w tym materiały oparte na publicznie dostępnych arkuszach
          CKE), powtórki, minigry i rankingi. Zakres darmowy i płatny jest
          opisany na stronie{" "}
          <Link href="/cennik" className="link-plain">
            cennika
          </Link>
          . Treść edukacyjna może się zmieniać — uzupełniamy i poprawiamy
          zadania.
        </p>
      </LegalSection>

      <LegalSection id="konto" title="2. Konto">
        <p>
          Konto jest dobrowolne. Podajesz prawdziwy e-mail, bo służy do logowania
          i odzyskiwania hasła. Nick nie może imitować innej osoby, urzędu ani
          CKE. Możesz usunąć konto w profilu. Operator może zablokować konto
          przy oczywistym nadużyciu (łamanie limitu API, oszustwa w rankingach,
          ataki na infrastrukturę).
        </p>
      </LegalSection>

      <LegalSection id="tresci" title="3. Treści i arkusze CKE">
        <p>
          Oficjalne arkusze i klucze pochodzą z materiałów Centralnej Komisji
          Egzaminacyjnej udostępnianych publicznie. CKE nie jest partnerem ani
          wydawcą tego serwisu. Rozwiązania i wyjaśnienia mogą zawierać błędy
          — zgłaszaj je, a my je weryfikujemy. Nie gwarantujemy wyniku na
          egzaminie.
        </p>
      </LegalSection>

      <LegalSection id="platnosci" title="4. Płatności">
        <p>
          Plan Pro i Roczny rozlicza Stripe. Cena i okres są podane przed
          płatnością. Rezygnacja działa zgodnie z zasadami subskrypcji Stripe
          (koniec opłaconego okresu, jeśli nie zaznaczono inaczej). Prawo
          odstąpienia od umowy zawartej na odległość przysługuje konsumentowi
          na zasadach ustawy o prawach konsumenta, z zastrzeżeniem treści
          cyfrowych dostarczanych za wyraźną zgodą przed upływem 14 dni.
        </p>
      </LegalSection>

      <LegalSection id="odpowiedzialnosc" title="5. Odpowiedzialność">
        <p>
          Serwis jest dostarczany „tak jak jest”. Staramy się, żeby działał
          bez przerw i z poprawnymi zadaniami, ale mogą wystąpić awarie,
          limity AI albo błędy merytoryczne. Nie odpowiadamy za utratę XP,
          wyniku w rankingu ani za decyzje podjęte wyłącznie na podstawie
          treningu w serwisie. Limit ten nie wyłącza odpowiedzialności, której
          nie można wyłączyć wobec konsumenta.
        </p>
      </LegalSection>

      <LegalSection id="zmiany" title="6. Zmiany regulaminu">
        <p>
          O istotnej zmianie poinformujemy w serwisie. Dalsze korzystanie po
          publikacji oznacza akceptację nowej wersji. Aktualna data dokumentu
          jest na górze strony.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
