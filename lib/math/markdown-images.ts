export type MarkdownImageMatch = {
  index: number;
  length: number;
  alt: string;
  src: string;
};

/**
 * Znajduje obrazy w markdownie `![alt](src)` z obsługą nawiasów w URL.
 *
 * Zwykły regex `\\(([^)]+)\\)` ucinał data-URI SVG w pierwszym `)`, np. w
 * `url(#clip)` albo `text(-1,-3)`. Reszta URL-a zostawała jako widoczny tekst
 * i potrafiła rozsadzić layout (setki/ tysiące pikseli szerokości).
 * Tutaj liczymy zagnieżdżone nawiasy, więc data-URI działa w całości.
 */
export function findMarkdownImages(text: string): MarkdownImageMatch[] {
  const matches: MarkdownImageMatch[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf("![", cursor);
    if (start === -1) break;

    const altStart = start + 2;
    const altEnd = text.indexOf("](", altStart);
    if (altEnd === -1) break;

    let index = altEnd + 2;
    let depth = 1;
    while (index < text.length && depth > 0) {
      const char = text[index];
      if (char === "(") depth += 1;
      else if (char === ")") depth -= 1;
      index += 1;
    }
    if (depth !== 0) break;

    const src = text.slice(altEnd + 2, index - 1);
    const alt = text.slice(altStart, altEnd);
    if (src.trim()) {
      matches.push({
        index: start,
        length: index - start,
        alt,
        src,
      });
    }
    cursor = index;
  }

  return matches;
}

export function replaceMarkdownImages(
  text: string,
  replace: (match: MarkdownImageMatch) => string,
): string {
  const matches = findMarkdownImages(text);
  if (matches.length === 0) return text;

  let out = "";
  let cursor = 0;
  for (const match of matches) {
    out += text.slice(cursor, match.index);
    out += replace(match);
    cursor = match.index + match.length;
  }
  out += text.slice(cursor);
  return out;
}
