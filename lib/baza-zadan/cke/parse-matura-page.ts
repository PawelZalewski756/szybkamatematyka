/** Parsowanie listy zadań z publicznej strony arkusza (HTML). */

import { formatCkeMathText } from "./format-cke-math";
import { injectImagesIntoHtmlChunk } from "./matura-images";

export type ParsedMaturaTask = {
  numer: number;
  tresc: string;
};

/**
 * Usuwa statystyki „pwz” i śmieci scrapera, potem normalizuje matematykę do LaTeX.
 * Wywoływane przy seedzie — kolejne importy nie wpuszczają znowu HTML ani surowego Unicode.
 */
export function cleanMaturaTaskText(text: string): string {
  const cleaned = text
    .replace(/\s*pwz:\s*\d+%[\s\S]*$/i, "")
    .replace(/\s*Poziom wykonania zadania[\s\S]*$/i, "")
    // Urwany tag HTML bez `>` (klasyczny śmieć scrapera: `<ul class="`).
    .replace(/<[a-zA-Z][^<>]*$/gm, "")
    .replace(/&radic;/g, "√")
    .replace(/&fnof;/g, "f")
    .replace(/&frasl;/g, "/")
    .replace(/&lang;/g, "⟨")
    .replace(/&rang;/g, "⟩")
    .replace(/&raquo;/g, "»")
    .replace(/&alpha;/g, "α")
    .replace(/&ge;/g, "≥")
    .replace(/&#8738;/g, "∠")
    .replace(/&#8730;/g, "√")
    .replace(/&#8731;/g, "∛")
    .replace(/\s+/g, " ")
    .trim();

  return formatCkeMathText(cleaned);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    // Niekompletne tagi bez `>` (stripHtml wcześniej je zostawiał).
    .replace(/<[a-zA-Z][^<>]*$/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function htmlChunkToTresc(htmlChunk: string): string {
  const withImages = injectImagesIntoHtmlChunk(htmlChunk);
  return cleanMaturaTaskText(stripHtml(withImages));
}

function sliceTaskSection(html: string): string {
  let body = html;
  const lista = body.search(/Lista zada[nń]/i);
  if (lista >= 0) body = body.slice(lista);

  const end = body.search(
    /Udost[eę]pnij|Pomysły na studia|Rekrutacja na studia|Komentarze/i,
  );
  if (end > 0) body = body.slice(0, end);
  return body;
}

const TASK_HEAD =
  /Zadanie\s+(\d+(?:\.\d+)?)\.\s*<span[^>]*>\([^)]*\)<\/span>/gi;

/** Łączy podzadania 14.1, 14.2 w jedno zadanie główne. */
export function parseMaturaTasksFromHtml(html: string): ParsedMaturaTask[] {
  const body = sliceTaskSection(html);
  const hits = [...body.matchAll(TASK_HEAD)];

  if (hits.length === 0) {
    return parseLegacyPlain(html);
  }

  const byMain = new Map<number, string[]>();

  for (let i = 0; i < hits.length; i++) {
    const label = hits[i][1] ?? "0";
    const main = Math.floor(parseFloat(label));
    const start = hits[i].index ?? 0;
    const end = i + 1 < hits.length ? (hits[i + 1].index ?? body.length) : body.length;
    let chunk = body.slice(start, end);
    chunk = chunk.replace(TASK_HEAD, "");
    const text = htmlChunkToTresc(chunk);
    if (!text) continue;

    const parts = byMain.get(main) ?? [];
    if (label.includes(".")) {
      parts.push(`[${label}] ${text}`);
    } else {
      parts.unshift(text);
    }
    byMain.set(main, parts);
  }

  return [...byMain.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numer, parts]) => ({
      numer,
      tresc: parts.join("\n\n").trim(),
    }));
}

/** Starsze arkusze (2010–2013) — prostszy układ HTML. */
function parseLegacyPlain(html: string): ParsedMaturaTask[] {
  const body = sliceTaskSection(html);
  const re = /Zadanie\s+(\d+)\.([\s\S]*?)(?=Zadanie\s+\d+\.|$)/gi;
  const tasks: ParsedMaturaTask[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const numer = Number(m[1]);
    const tresc = htmlChunkToTresc(m[2] ?? "");
    if (numer > 0 && tresc.length > 10) {
      tasks.push({ numer, tresc });
    }
  }
  return tasks;
}

/** Heurystyka działu na podstawie treści zadania maturalnego. */
export function inferDzialMatura(tresc: string, numer: number): string {
  const t = tresc.toLowerCase();
  if (/wykaż|dowód|dzieli.*przez/.test(t)) return "Algebra";
  if (/prawdopodobieństw|losuj|wylosow/.test(t)) return "Prawdopodobieństwo";
  if (/mediana|średnia|diagram|ocen/.test(t)) return "Statystyka";
  if (/ciąg|wyraz ciągu|arytmetyczn|geometryczn/.test(t)) return "Ciągi";
  if (/sin|cos|tg|kąt\s+\w+\s+ma\s+miarę/.test(t)) return "Trygonometria";
  if (/funkcj|parabol|wykres|współrzędn|prosta\s+\w+:/.test(t)) return "Funkcje";
  if (/trójkąt|okrąg|równoległobok|ostrosłup|graniastosłup|pole\s+/.test(t))
    return "Geometria";
  if (/log|potęg|\^\d|2\^/.test(t)) return numer <= 4 ? "Potęgi" : "Algebra";
  if (/równan|nierówność|wielomian/.test(t)) return "Równania";
  if (/kod|cyfr|permutac/.test(t)) return "Kombinatoryka";
  if (/procent|drzew|sad/.test(t)) return "Procenty";
  return "Algebra";
}
