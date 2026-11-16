import { afterEach, describe, expect, it, vi } from "vitest";
import { getOperatorDetails } from "@/lib/legal/operator";

describe("getOperatorDetails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("zwraca null, gdy dane nie są ustawione", () => {
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_NAME", "");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_ADDRESS", "");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_NIP", "");
    expect(getOperatorDetails()).toBeNull();
  });

  it("zwraca dane operatora i domyślny e-mail kontaktowy", () => {
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_NAME", "Firma Testowa sp. z o.o.");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_ADDRESS", "ul. Testowa 1, 00-001 Warszawa");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_NIP", "1234567890");
    vi.stubEnv("NEXT_PUBLIC_OPERATOR_EMAIL", "");

    expect(getOperatorDetails()).toEqual({
      name: "Firma Testowa sp. z o.o.",
      address: "ul. Testowa 1, 00-001 Warszawa",
      nip: "1234567890",
      email: "kontakt@szybkamatematyka.pl",
    });
  });
});
