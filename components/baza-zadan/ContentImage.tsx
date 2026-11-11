type ContentImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Ilustracja z arkusza CKE - bez rozciągania małych rysunków na pełną szerokość. */
export function ContentImage({ src, alt = "", className = "" }: ContentImageProps) {
  const rawAlt = alt.trim();
  const caption = /^(Rysunek do zadania|Zadanie \d+)$/i.test(rawAlt) ? "" : rawAlt;
  const isFigure = /-fig\d+\.png$/.test(src);
  const imgClass =
    "mx-auto max-h-[min(360px,55vh)] w-auto max-w-full object-contain";

  return (
    <figure
      className={`my-3 flex flex-col items-center rounded-xl border border-surface-border bg-surface p-2 ${className}`}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        title="Otwórz obrazek w pełnej wielkości"
        className="flex max-w-full justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isFigure ? src.replace(/\.png$/, "-dark.png") : src}
          alt={caption || "Ilustracja do zadania"}
          loading="lazy"
          decoding="async"
          className={isFigure ? `fig-dark ${imgClass}` : imgClass}
        />
        {isFigure ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={caption || "Ilustracja do zadania"}
            loading="lazy"
            decoding="async"
            className={`fig-light hidden ${imgClass}`}
          />
        ) : null}
      </a>
      {caption ? (
        <figcaption className="mt-1.5 max-w-prose text-center text-xs text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
