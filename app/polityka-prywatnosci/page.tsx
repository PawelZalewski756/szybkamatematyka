import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import {
  LEGAL_DOMAIN,
  LEGAL_OPERATOR,
  LEGAL_SITE,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Jak Szybka Matematyka przetwarza dane: konto, nauka, płatności Stripe, asystent Gemini i Twoje prawa.",
  alternates: { canonical: "/polityka-prywatnosci" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument title="Polityka prywatności">
      <p>
        Ta polityka opisuje, jakie dane przetwarza serwis {LEGAL_OPERATOR}{" "}
        ({LEGAL_SITE}). Nie zbieramy danych „na zapas”. Jeśli jakiejś
        funkcji nie włączysz (konto, płatność, asystent AI), związane z nią
        dane nie powstają.
      </p>

      <LegalSection id="administrator" title="1. Administrator">
        <p>
          Administratorem danych jest operator serwisu {LEGAL_OPERATOR},
          dostępnego pod domeną {LEGAL_DOMAIN}. Kontakt w sprawach danych:
          przez stronę{" "}
          <Link href="/profil" className="link-plain">
            profilu
          </Link>{" "}
          (eksport i usunięcie konta) albo przez formularz logowania na{" "}
          {LEGAL_SITE}.
        </p>
        <p>
          Nie publikujemy w tym dokumencie fikcyjnego adresu siedziby ani NIP
          — jeśli operator zarejestruje działalność, dane identyfikacyjne
          zostaną tu uzupełnione.
        </p>
      </LegalSection>

      <LegalSection id="zakres" title="2. Jakie dane przetwarzamy">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Konto:</strong> e-mail, hasło
            (hash w Supabase Auth), nick, klasa szkolna, awatar, ustawienia
            powiadomień o serii.
          </li>
          <li>
            <strong className="text-foreground">Nauka:</strong> rozwiązane
            zadania, harmonogram powtórek, opanowanie tematów, wyniki
            wyzwań i pojedynków, odznaki, XP i seria dni.
          </li>
          <li>
            <strong className="text-foreground">Płatności (opcjonalnie):</strong>{" "}
            identyfikatory klienta i subskrypcji Stripe, status planu. Numeru
            karty nie przechowujemy — robi to Stripe.
          </li>
          <li>
            <strong className="text-foreground">Asystent AI (opcjonalnie):</strong>{" "}
            treść zadania i Twoje pytanie wysyłane do Google Gemini, żeby
            zwrócić wskazówkę. Limit darmowych zapytań jest liczony w profilu.
          </li>
          <li>
            <strong className="text-foreground">Techniczne:</strong> logi
            błędów (komunikat, ścieżka, identyfikator żądania) i — jeśli
            skonfigurowano — raporty do Sentry. Nie zapisujemy haseł ani
            treści rozwiązań w monitoringu.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="podstawa" title="3. Podstawa i cel">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            wykonanie umowy o świadczenie usługi drogą elektroniczną (konto,
            trening, powtórki) — art. 6 ust. 1 lit. b RODO;
          </li>
          <li>
            obowiązek prawny (rachunkowość płatności, reklamacje) — lit. c;
          </li>
          <li>
            prawnie uzasadniony interes: bezpieczeństwo, limity nadużyć,
            diagnostyka awarii, anonimowe liczniki użycia — lit. f.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="procesorzy" title="4. Podmioty przetwarzające">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Supabase</strong> — baza,
            logowanie, pliki awatarów. Dane mogą być przetwarzane w UE lub w
            regionie wskazanym w projekcie Supabase.
          </li>
          <li>
            <strong className="text-foreground">Google (Gemini)</strong> —
            wyłącznie gdy użyjesz asystenta przy zadaniu. Treść zapytania
            trafia do Google w celu wygenerowania odpowiedzi.
          </li>
          <li>
            <strong className="text-foreground">Stripe</strong> — gdy kupisz
            plan Pro / Roczny. Stripe jest niezależnym administratorem danych
            płatniczych.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> — hosting
            aplikacji.
          </li>
          <li>
            <strong className="text-foreground">Sentry</strong> — tylko gdy
            operator skonfiguruje DSN; wtedy wybrane błędy serwera są tam
            raportowane w celu naprawy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" title="5. Cookies i tracking">
        <p>
          Serwis nie wstawia pikseli reklamowych ani analityki marketingowej.
          Sesja logowania działa w pamięci przeglądarki (localStorage klienta
          Supabase). Postęp gościa i wybór klasy też są lokalne. Nie pokazujemy
          bannera cookies, bo nie używamy zbędnych trackerów.
        </p>
        <p>
          Anonimowe metryki produktowe to dzienne liczniki zdarzeń (np. że
          ktoś zaczął trening), bez identyfikatora użytkownika, bez e-maila i
          bez łączenia z kontem. Służą do zrozumienia, które części serwisu
          działają.
        </p>
      </LegalSection>

      <LegalSection id="retencja" title="6. Retencja">
        <p>
          Dane konta trzymamy, dopóki konto istnieje. Po usunięciu konta
          kasujemy profil, postęp, powtórki, awatar i powiązane wiersze w
          bazie. Logi błędów i kopie zapasowe infrastruktury wygasają zgodnie
          z polityką dostawcy hostingu (zazwyczaj do 90 dni). Dane płatności
          Stripe podlegają ich retencji rachunkowej.
        </p>
      </LegalSection>

      <LegalSection id="prawa" title="7. Twoje prawa">
        <p>
          Masz prawo do dostępu, sprostowania, ograniczenia, sprzeciwu,
          przenoszenia i usunięcia danych oraz skargi do PUODO. W serwisie:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            eksport JSON z{" "}
            <Link href="/profil" className="link-plain">
              profilu
            </Link>
            ;
          </li>
          <li>usunięcie konta z tego samego miejsca (nieodwracalne);</li>
          <li>zmiana nicku, klasy i awatara bez kontaktu z nami.</li>
        </ul>
      </LegalSection>

      <LegalSection id="incydent" title="8. Naruszenia ochrony danych">
        <p>
          Przy podejrzeniu wycieku izolujemy dostęp (klucze, sesje), sprawdzamy
          zakres, powiadamiamy UODO w ustawowym terminie, gdy ryzyko jest
          wysokie, i informujemy osoby, których to dotyczy. Szczegóły
          operacyjne są w dokumentacji wdrożenia serwisu.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
