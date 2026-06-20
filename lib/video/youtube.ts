/** Wyciąga ID filmu z typowych adresów YouTube. */
export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const embedMatch = /^\/embed\/([\w-]{11})/.exec(parsed.pathname);
      if (embedMatch) return embedMatch[1]!;
      const shortsMatch = /^\/shorts\/([\w-]{11})/.exec(parsed.pathname);
      if (shortsMatch) return shortsMatch[1]!;
    }
  } catch {
    /* niepoprawny URL */
  }

  return null;
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
