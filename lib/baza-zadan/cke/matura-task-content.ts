export type TaskContentPart =
  | { type: "text"; content: string }
  | { type: "image"; alt: string; src: string };

const IMAGE_MARKDOWN_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

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
