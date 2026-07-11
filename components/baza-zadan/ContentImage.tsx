type ContentImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Ilustracja z arkusza CKE — bez rozciągania małych rysunków na pełną szerokość. */
export function ContentImage({ src, alt = "", className = "" }: ContentImageProps) {
  const caption = alt.trim();

  return (
    <figure
      className={`my-3 flex flex-col items-center rounded-xl border border-surface-border bg-surface p-2 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption || "Ilustracja do zadania"}
        loading="lazy"
        decoding="async"
        className="mx-auto max-h-[min(360px,55vh)] w-auto max-w-full object-contain"
      />
      {caption ? (
        <figcaption className="mt-1.5 max-w-prose text-center text-xs text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
