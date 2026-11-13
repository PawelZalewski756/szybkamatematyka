/**
 * Naprawa tabel Markdown, które nie spełniają wymagań GFM.
 *
 * Arkusze CKE mają czasem tabelę bez nagłówka, np.:
 *
 *   | |
 *   |:---|:---:|:---:|
 *   | Współczynnik a ... | P | F |
 *
 * GFM wymaga, żeby wiersz nagłówka miał tyle samo komórek co wiersz separatora.
 * Przy jednej komórce w nagłówku cała tabela nie jest parsowana i użytkownik
 * widzi surowe `|:---|` zamiast tabeli. Analogicznie `| CENNIK BILETÓW |` nad
 * dwiema kolumnami.
 *
 * Funkcja dopełnia nagłówek pustymi komórkami. Nie zmienia poprawnych tabel.
 */

/** Dzieli wiersz tabeli na komórki, ignorując `|` wewnątrz `$...$`. */
function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let inMath = false;

  for (const char of trimmed) {
    if (char === "$") {
      inMath = !inMath;
      current += char;
      continue;
    }
    if (char === "|" && !inMath) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);

  return cells.map((cell) => cell.trim());
}

/** Wiersz separatora, np. `|:---|:---:|:---:|`. */
function isDelimiterRow(line: string): boolean {
  if (!line.trim().startsWith("|") || !line.includes("-")) return false;
  const cells = splitRow(line);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{1,}:?$/.test(cell));
}

function buildRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

/**
 * Dopełnia nagłówki tabel, które mają mniej komórek niż wiersz separatora.
 * Zwraca markdown bez zmian, jeśli nie ma czego poprawiać.
 */
export function fixMarkdownTables(markdown: string): string {
  if (!markdown.includes("|") || !markdown.includes("-")) return markdown;

  const lines = markdown.split("\n");
  let changed = false;
  let inFence = false;

  for (let i = 0; i < lines.length - 1; i += 1) {
    const header = lines[i]!;
    const fence = /^\s*(```|~~~)/.exec(header);
    if (fence) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const delimiter = lines[i + 1]!;

    if (!header.trim().startsWith("|") || !isDelimiterRow(delimiter)) {
      continue;
    }

    const headerCells = splitRow(header);
    const delimiterCells = splitRow(delimiter);
    if (headerCells.length >= delimiterCells.length) continue;

    const padded = [
      ...headerCells,
      ...Array.from({ length: delimiterCells.length - headerCells.length }, () => ""),
    ];
    lines[i] = buildRow(padded);
    changed = true;
  }

  return changed ? lines.join("\n") : markdown;
}
