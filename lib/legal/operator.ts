import { CONTACT_EMAIL } from "@/lib/brand/constants";

export type OperatorDetails = {
  name: string;
  address: string;
  nip: string;
  email: string;
};

/**
 * Dane operatora są konfigurowane zmiennymi środowiskowymi, bo nie należą do
 * kodu. Dopóki nie są ustawione, sekcja nie pojawia się w regulaminie - nie
 * chcemy publikować wymyślonych danych firmy.
 */
export function getOperatorDetails(): OperatorDetails | null {
  const name = process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim();
  const address = process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim();
  const nip = process.env.NEXT_PUBLIC_OPERATOR_NIP?.trim();
  if (!name || !address || !nip) return null;

  return {
    name,
    address,
    nip,
    email: process.env.NEXT_PUBLIC_OPERATOR_EMAIL?.trim() || CONTACT_EMAIL,
  };
}
