/**
 * Deterministyczny generator liczb pseudolosowych (mulberry32) oraz pomocnik
 * `withSeededRandom`, który tymczasowo podmienia globalny `Math.random`.
 *
 * Dzięki temu reużywamy WSZYSTKIE istniejące generatory pytań minigier
 * (lib/minigry/questions/generators.ts) BEZ ich modyfikacji — generatory
 * wewnętrznie korzystają z `Math.random`, więc po podmianie na ziarnowany
 * PRNG ten sam seed daje identyczny ciąg pytań u obu graczy.
 */

/** Klasyczny mulberry32 — szybki, deterministyczny PRNG zwracający [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Wykonuje `fn` z `Math.random` podmienionym na ziarnowany PRNG, a następnie
 * przywraca oryginał. Synchroniczne — bezpieczne w środowisku jednowątkowym
 * przeglądarki. NIE używać wokół kodu asynchronicznego.
 */
export function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  const rng = mulberry32(seed);
  // Podmiana właściwości obiektu globalnego (nie nadpisujemy samego `Math`).
  Math.random = rng;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

/** Losowy 32-bitowy seed (do tworzenia nowego pojedynku). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Krótki, czytelny kod pokoju (bez mylących znaków 0/O/1/I) wyprowadzony
 * deterministycznie z seeda — ten sam seed → ten sam kod.
 */
export function roomCodeFromSeed(seed: number, length = 5): string {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ROOM_CODE_ALPHABET[Math.floor(rng() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/** Hash kodu pokoju → seed (gdy gracz dołącza tylko po kodzie). */
export function seedFromRoomCode(code: string): number {
  let h = 0x811c9dc5;
  const upper = code.trim().toUpperCase();
  for (let i = 0; i < upper.length; i += 1) {
    h ^= upper.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
