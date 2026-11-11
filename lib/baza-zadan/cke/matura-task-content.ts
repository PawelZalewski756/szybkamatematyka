export type TaskContentPart =
  | { type: "text"; content: string }
  | { type: "image"; alt: string; src: string };

const IMAGE_MARKDOWN_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

/** Usuwa z treści tabelę punktacji "Wypełnia egzaminator" przeniesioną z arkusza PDF. */
export function stripExaminerTable(tresc: string): string {
  if (!/Wypełnia\s+egzaminator/i.test(tresc)) return tresc;
  const lines = tresc.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    let j = i;
    while (j < lines.length && /^\s*\|/.test(lines[j]!)) j++;
    if (j > i) {
      const block = lines.slice(i, j).join("\n");
      if (!/Wypełnia\s+egzaminator/i.test(block)) out.push(block);
      i = j;
      continue;
    }
    out.push(lines[i]!);
    i++;
  }
  return out
    .join("\n")
    .replace(/Wypełnia\s+egzaminator[\s\S]*?Uzyskana\s+liczba\s+pkt[^\n]*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Dzieli treść zadania na bloki tekstu i obrazków (markdown). */
export function splitTaskContent(tresc: string): TaskContentPart[] {
  const parts: TaskContentPart[] = [];
  let lastIndex = 0;

  for (const match of tresc.matchAll(IMAGE_MARKDOWN_RE)) {
    const index = match.index ?? 0;
    const before = tresc.slice(lastIndex, index).trim();
    if (before) parts.push({ type: "text", content: before });

    const alt = match[1] ?? "Rysunek";
    const src = match[2] ?? "";
    if (src) parts.push({ type: "image", alt, src });

    lastIndex = index + match[0].length;
  }

  const tail = tresc.slice(lastIndex).trim();
  if (tail) parts.push({ type: "text", content: tail });

  if (parts.length === 0 && tresc.trim()) {
    parts.push({ type: "text", content: tresc.trim() });
  }

  return parts;
}

export function taskContentHasImages(tresc: string): boolean {
  return IMAGE_MARKDOWN_RE.test(tresc);
}
