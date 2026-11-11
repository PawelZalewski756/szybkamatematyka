/**
 * Naprawia układ odpowiedzi A-D i niedomknięte `$` w treści zadań z bazy.
 *
 * Dane z OCR często mają opcje sklejone w jednej linii ("A) 4B) 5C) 6D) 7")
 * oraz urwane formuły ("D) $S = \frac{1}{2}n" bez zamykającego `$`).
 */

const MARKER_RE = /(?<![A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ(])([A-D])\)(?=\s|\$|\d|\\|-|[a-ząćęłńóśźż(])/g;

/** Domyka nieparzystą liczbę `$` w linii (urwany LaTeX). */
function balanceDollars(line: string): string {
  const stripped = line.replace(/\$\$/g, "");
  const count = (stripped.match(/\$/g) ?? []).length;
  if (count % 2 === 0) return line;
  return `${line.trimEnd()}$`;
}

/** Wstawia podział linii przed kolejnymi markerami A) B) C) D) (min. dwa po kolei). */
function splitInlineChoices(line: string): string {
  const markers = [...line.matchAll(MARKER_RE)]
    .map((m) => ({ letter: m[1], index: m.index ?? 0 }))
    .filter(
      (m) => ((line.slice(0, m.index).match(/(?<!\$)\$(?!\$)/g) ?? []).length % 2) === 0,
    );
  if (markers.length < 2) return line;

  const accepted = markers.filter((m, i) => {
    const prev = markers[i - 1];
    const next = markers[i + 1];
    const code = m.letter.charCodeAt(0);
    return (
      (next !== undefined && next.letter.charCodeAt(0) === code + 1) ||
      (prev !== undefined && prev.letter.charCodeAt(0) === code - 1)
    );
  });
  if (accepted.length < 2) return line;

  let out = "";
  let last = 0;
  for (const m of accepted) {
    out += line.slice(last, m.index).trimEnd();
    out += "\n";
    last = m.index;
  }
  out += line.slice(last);
  return out.replace(/^\n/, "");
}

/** Normalizuje treść: podział opcji na osobne linie + domknięcie `$`. */
export function normalizeAbcdLayout(tresc: string): string {
  const inFence = (s: string) => /^\s*(```|\$\$)/.test(s);
  return tresc
    .split("\n")
    .map((line) => {
      if (inFence(line) || /!\[[^\]]*\]\(/.test(line)) return line;
      return balanceDollars(splitInlineChoices(line).split("\n").map(balanceDollars).join("\n"));
    })
    .join("\n")
    .replace(/\n(?=[A-D][.)]\s)/g, "  \n");
}
