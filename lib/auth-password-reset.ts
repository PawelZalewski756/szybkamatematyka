/** URL przekierowania po kliknięciu linku resetu hasła w e-mailu. */
export function passwordResetRedirectUrl(): string {
  if (typeof window === "undefined") {
    return "/login/nowe-haslo";
  }
  return `${window.location.origin}/login/nowe-haslo`;
}
