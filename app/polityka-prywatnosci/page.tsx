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
      updatedAt="1 listopada 2026"
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
            uwierzytelniania), opcjonalnie dane profilu (np. nick, poziom
            nauki, awatar).
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
            Obsługa nowych kont — administrator otrzymuje przez prywatnego bota
            Telegram powiadomienie zawierające nick, adres e-mail, wybrany
            poziom nauki i status potwierdzenia adresu.
          </li>
          <li>
            Uzasadniony interes — bezpieczeństwo i przeciwdziałanie nadużyciom.
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
          Korzystamy z dostawców infrastruktury (hosting, baza danych,
          uwierzytelnianie, płatności Stripe) oraz Telegrama do prywatnych
          powiadomień administracyjnych o nowych kontach. W takim powiadomieniu
          administrator otrzymuje nick, adres e-mail, poziom nauki i status
          potwierdzenia adresu; wiadomość jest przetwarzana przez Telegram
          zgodnie z jego zasadami prywatności. Jeśli tag Google Ads jest
          skonfigurowany, Google otrzymuje dane z jego działania w celu pomiaru
          reklam. Dane nie są sprzedawane.
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
          Serwis używa niezbędnych mechanizmów sesji i uwierzytelniania. Własne
          anonimowe statystyki odwiedzin i zdarzeń są wyłączone. Skonfigurowany
          tag Google Ads działa odrębnie i może korzystać z własnych technologii
          pomiarowych Google.
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
