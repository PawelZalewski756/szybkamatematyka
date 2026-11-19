/**
 * Znane domeny jednorazowych skrzynek (temp-mail).
 *
 * To tylko pierwsza linia obrony - lista nigdy nie będzie pełna, bo nowe
 * domeny powstają codziennie. Prawdziwym zabezpieczeniem programu poleceń
 * jest wymóg aktywności (7 dni + 3 zadania), a nie sam adres e-mail.
 *
 * Dopisuj kolejne domeny tutaj; sprawdzanie obejmuje też subdomeny
 * (np. `cokolwiek.mailinator.com`).
 */
const DISPOSABLE_DOMAINS = new Set(
  [
    "10minutemail.com",
    "10minutemail.net",
    "10minutemail.org",
    "10minutemail.pl",
    "10minutemail.co.uk",
    "20minutemail.com",
    "1secmail.cc",
    "1secmail.com",
    "1secmail.net",
    "1secmail.org",
    "1secmail.xyz",
    "binkmail.com",
    "bobmail.info",
    "burnermail.io",
    "cock.li",
    "cool.fr.nf",
    "discard.email",
    "discardmail.com",
    "discardmail.de",
    "dispostable.com",
    "dropmail.me",
    "emailondeck.com",
    "fakeinbox.com",
    "fakeinbox.net",
    "getnada.com",
    "guerrillamail.com",
    "guerrillamail.de",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamailblock.com",
    "grr.la",
    "harakirimail.com",
    "inboxkitten.com",
    "inboxkitten.net",
    "jetable.com",
    "jetable.net",
    "jetable.org",
    "mail.tm",
    "mail7.io",
    "mailcatch.com",
    "maildrop.cc",
    "mailinator.com",
    "mailinator.net",
    "mailinator2.com",
    "mailmetrash.com",
    "mailnesia.com",
    "mailnull.com",
    "mailpoof.com",
    "mailsac.com",
    "mailtrap.io",
    "mintemail.com",
    "moakt.com",
    "mohmal.com",
    "mohmal.net",
    "mvrht.com",
    "mvrht.net",
    "mytemp.email",
    "mytemp-mail.com",
    "nada.email",
    "notmailinator.com",
    "sharklasers.com",
    "spam4.me",
    "spamfree24.de",
    "spamfree24.eu",
    "spamfree24.info",
    "spamfree24.net",
    "spamfree24.org",
    "spamgourmet.com",
    "spamgourmet.net",
    "spamgourmet.org",
    "tmail.io",
    "tmail.ws",
    "tempail.com",
    "tempbox.me",
    "tempinbox.com",
    "temp-mail.io",
    "temp-mail.org",
    "tempmail.com",
    "tempmail.dev",
    "tempmail.net",
    "tempmail.plus",
    "tempmailaddress.com",
    "tempmailo.com",
    "tempomail.fr",
    "tempr.email",
    "tempsky.com",
    "temporary-mail.net",
    "temporarymail.com",
    "throwaway.email",
    "throwawaymail.com",
    "trash-mail.com",
    "trashmail.com",
    "trashmail.net",
    "trashmail.org",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
  ].map((domain) => domain.toLowerCase()),
);

export function isDisposableEmail(email: string): boolean {
  const domain = email
    .trim()
    .toLowerCase()
    .split("@")
    .pop()
    ?.replace(/\.+$/, "");

  if (!domain) return false;

  const parts = domain.split(".");
  for (let index = 0; index < parts.length; index += 1) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(index).join("."))) return true;
  }

  return false;
}
