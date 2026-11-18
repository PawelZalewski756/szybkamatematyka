export type TaskContentPart =
  | { type: "text"; content: string }
  | { type: "image"; alt: string; src: string };

import { findMarkdownImages } from "@/lib/math/markdown-images";

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

  for (const match of findMarkdownImages(tresc)) {
    const before = tresc.slice(lastIndex, match.index).trim();
    if (before) parts.push({ type: "text", content: before });

    if (match.src) parts.push({ type: "image", alt: match.alt || "Rysunek", src: match.src });

    lastIndex = match.index + match.length;
  }

  const tail = tresc.slice(lastIndex).trim();
  if (tail) parts.push({ type: "text", content: tail });

  if (parts.length === 0 && tresc.trim()) {
    parts.push({ type: "text", content: tresc.trim() });
  }

  return parts;
}

export function taskContentHasImages(tresc: string): boolean {
  return findMarkdownImages(tresc).length > 0;
}
