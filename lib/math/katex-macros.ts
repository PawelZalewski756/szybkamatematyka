/**
 * Makra KaTeX wspólne dla całej aplikacji.
 *
 * Baza KaTeX nie zna `\cancel` (to rozszerzenie LaTeX-a) i renderowała je jako
 * czerwone „Undefined control sequence”. `\enclose` też nie jest w naszym
 * KaTeX-ie, a `\htmlClass` wymagałoby `trust: true`, co przy treści z AI
 * otwiera drogę do wstrzyknięcia HTML.
 *
 * Dlatego makra są **no-op z zachowaniem treści**: `\cancel{6}` renderuje `6`.
 * Uczeń widzi poprawny ułamek bez skreślenia - to świadomy kompromis
 * bezpieczeństwa. Docelowo skreślenie można dodać warstwą CSS po
 * wygenerowaniu HTML (bez `trust`).
 */
export const KATEX_MACROS: Record<string, string> = {
  "\\cancel": "#1",
  "\\bcancel": "#1",
  "\\xcancel": "#1",
  "\\sout": "#1",
};

export const KATEX_OPTIONS = {
  macros: KATEX_MACROS,
  throwOnError: false,
  strict: "ignore" as const,
};
