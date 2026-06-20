import fs from "fs";
import path from "path";

export const MATURA_IMAGE_ORIGIN = "https://www.dlamaturzysty.info";

const IMAGE_MARKDOWN_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

/** Czy URL to ilustracja z arkusza (nie ikona layoutu). */
export function isMaturaTaskImageSrc(src: string): boolean {
  return /\/img\/testy\//i.test(src);
}

export function resolveMaturaAssetUrl(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return `${MATURA_IMAGE_ORIGIN}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

/**
 * Zamienia <img> z arkusza na markdown ![…](url) przed usunięciem HTML.
 */
export function injectImagesIntoHtmlChunk(html: string): string {
  return html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi, (_, src) => {
    if (!isMaturaTaskImageSrc(src)) return " ";
    const url = resolveMaturaAssetUrl(src);
    return `\n\n![Rysunek do zadania](${url})\n\n`;
  });
}

/** Pobiera obrazki do public/cke-matura i podmienia URL na ścieżki lokalne. */
export async function localizeMaturaImagesInTresc(
  tresc: string,
  sessionId: string,
  taskNum: number,
): Promise<string> {
  let out = tresc;
  let imageIndex = 0;

  const matches = [...tresc.matchAll(IMAGE_MARKDOWN_RE)];
  for (const match of matches) {
    const full = match[0];
    const alt = match[1] ?? "Rysunek";
    const url = match[2];
    if (!url) continue;

    const isRemote =
      url.startsWith("http") && url.includes("dlamaturzysty");
    const isAlreadyLocal = url.startsWith("/cke-matura/");

    if (!isRemote && !isAlreadyLocal) continue;

    if (isAlreadyLocal) continue;

    imageIndex += 1;
    let ext = ".png";
    try {
      ext = path.extname(new URL(url).pathname) || ".png";
    } catch {
      ext = ".png";
    }

    const relPath = `/cke-matura/${sessionId}/z${String(taskNum).padStart(2, "0")}-${imageIndex}${ext}`;
    const dest = path.join(process.cwd(), "public", relPath.replace(/^\//, ""));

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const res = await fetch(url, {
        headers: { "User-Agent": "SzybkaMatma-CKE-Import/1.0" },
      });
      if (!res.ok) {
        console.warn(`  ⚠ Nie pobrano obrazka: ${url} (${res.status})`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
    }

    const localized = `![${alt}](${relPath})`;
    out = out.replace(full, localized);
  }

  return out;
}

