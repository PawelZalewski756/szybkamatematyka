const NUMBER_FORMAT = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 2,
});

/**
 * Odpowiedzi numeryczne w minigrach: polski przecinek zamiast kropki
 * (0,5 zamiast 0.5). Wcześniej opcje były wypisywane surowym `String(number)`.
 */
export function formatNumericAnswer(value: number): string {
  return NUMBER_FORMAT.format(value);
}
