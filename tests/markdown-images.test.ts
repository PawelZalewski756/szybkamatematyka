import { describe, expect, it } from "vitest";
import {
  findMarkdownImages,
  replaceMarkdownImages,
} from "@/lib/math/markdown-images";
import { splitTaskContent } from "@/lib/baza-zadan/cke/matura-task-content";

const svg = encodeURIComponent(
  '<svg viewBox="0 0 240 180"><g clip-path="url(#clip)"><text>(-1,-3)</text></g></svg>',
);
const dataUri = `data:image/svg+xml,${svg}`;

describe("markdown images z data URI", () => {
  it("nie ucina URL-a na nawiasie z url(#clip) ani (-1,-3)", () => {
    const content = `![Wykres funkcji](${dataUri})\n\nOdczytaj wierzchołek.`;
    const matches = findMarkdownImages(content);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.src).toBe(dataUri);
    expect(matches[0]?.alt).toBe("Wykres funkcji");
  });

  it("splitTaskContent zwraca obraz i tekst, bez widocznego %3Csvg", () => {
    const content = `![Wykres funkcji](${dataUri})\n\nOdczytaj wierzchołek.`;
    const parts = splitTaskContent(content);
    expect(parts.map((part) => part.type)).toEqual(["image", "text"]);
    expect(parts[0]).toMatchObject({ type: "image", src: dataUri });
    expect(parts[1]).toMatchObject({
      type: "text",
      content: "Odczytaj wierzchołek.",
    });
  });

  it("replaceMarkdownImages podstawia cały obraz", () => {
    const content = `A ![alt](${dataUri}) B`;
    expect(replaceMarkdownImages(content, () => "[IMG]")).toBe("A [IMG] B");
  });
});
