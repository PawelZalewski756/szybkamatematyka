import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/info/InfoPageShell";
import {
  BRAND_DOMAIN,
  BRAND_NAME,
  CONTACT_EMAIL,
} from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: `Polityka prywatności ${BRAND_NAME} — jakie dane zbieramy, w jakim celu i jakie masz prawa (RODO).`,
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <InfoPageShell
      title="Polityka prywatności"
      description={`Informacje o przetwarzaniu danych osobowych w serwisie ${BRAND_NAME}.`}
      updatedAt="27 października 2026"
    >
      <InfoSection title="1. Administrator">
        <p>
          Administratorem danych osobowych użytkowników serwisu {BRAND_NAME} (
          {BRAND_DOMAIN}) jest operator platformy. W sprawach prywatności pisz
          na:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection title="2. Jakie dane zbieramy">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Dane konta: adres e-mail, hasło (w formie zaszyfrowanej u dostawcy
            uwierzytelniania), opcjonalnie dane profilu (np. nick, klasa,
            awatar).
          </li>
          <li>
            Dane użytkowania: postęp nauki, wyniki minigier, wyzwań, ustawienia
            przypomnień.
          </li>
          <li>
            Dane techniczne: logi, typ urządzenia/przeglądarki, przybliżona
            lokalizacja na podstawie IP — w zakresie potrzebnym do działania i
            bezpieczeństwa Serwisu.
          </li>
          <li>
            Dane płatności: transakcje subskrypcji są obsługiwane przez Stripe;
            nie przechowujemy pełnych numerów kart w Serwisie.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Cele i podstawy">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Świadczenie usługi (umowa / żądanie usługi) — konto, trening,
            subskrypcja.
          </li>
          <li>
            Uzasadniony interes — bezpieczeństwo, analityka w celu ulepszania
            platformy, przeciwdziałanie nadużyciom.
          </li>
          <li>
            Obowiązki prawne — rozliczenia i wymagania księgowe związane z
            płatnościami.
          </li>
          <li>Zgoda — gdy wyraźnie o nią prosimy (np. marketing, jeśli kiedyś
            zostanie wprowadzony).</li>
        </ul>
      </InfoSection>

      <InfoSection title="4. Odbiorcy danych">
        <p>
          Korzystamy z zaufanych dostawców infrastruktury (hosting, baza danych,
          uwierzytelnianie, płatności Stripe). Przekazujemy im tylko dane
          niezbędne do realizacji usług. Dane nie są sprzedawane.
        </p>
      </InfoSection>

      <InfoSection title="5. Okres przechowywania">
        <p>
          Dane konta przechowujemy przez czas trwania konta oraz przez okres
          wymagany przepisami (np. rozliczenia). Po usunięciu konta usuwamy lub
          anonimizujemy dane osobowe, o ile prawo nie nakazuje dłuższego
          przechowywania.
        </p>
      </InfoSection>

      <InfoSection title="6. Twoje prawa">
        <p>
          Masz prawo dostępu do danych, ich sprostowania, usunięcia,
          ograniczenia przetwarzania, przenoszenia oraz sprzeciwu — w zakresie
          wynikającym z RODO. Możesz też złożyć skargę do Prezesa UODO.
        </p>
        <p>
          Aby skorzystać z praw, napisz na{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection title="7. Pliki cookies">
        <p>
          Serwis używa niezbędnych mechanizmów sesji i uwierzytelniania.
          Możemy stosować także narzędzia analityczne lub techniczne cookies
          ułatwiające działanie aplikacji. Szczegóły zależą od konfiguracji
          środowiska produkcyjnego.
        </p>
      </InfoSection>

      <InfoSection title="8. Bezpieczeństwo">
        <p>
          Stosujemy środki techniczne i organizacyjne odpowiednie do ryzyka
          (m.in. szyfrowanie połączeń HTTPS, polityki dostępu w bazie). Żaden
          system nie jest w 100% odporny — w razie incydentu podejmiemy
          wymagane prawem działania.
        </p>
      </InfoSection>

      <InfoSection title="9. Zmiany polityki">
        <p>
          Politykę możemy aktualizować. Aktualna wersja jest zawsze dostępna na
          tej stronie. Powiązane zasady korzystania:{" "}
          <Link href="/regulamin" className="font-semibold text-accent hover:underline">
            Regulamin
          </Link>
          .
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
