import type { Metadata } from "next";
import { SITE_NAME } from "./site";

type PageOpenGraphInput = {
  /** Ścieżka względna, np. "/cennik". */
  path: string;
  title: string;
  description: string;
};

/**
 * Pełny obiekt OpenGraph dla strony.
 *
 * Next.js zastępuje cały obiekt `openGraph` z layoutu, więc każde wywołanie
 * musi zawierać typ, locale i nazwę serwisu - inaczej social previews tracą
 * te pola. `url` jest ścieżką względną; `metadataBase` rozwiązuje ją do
 * bezwzględnego adresu.
 */
export function pageOpenGraph({
  path,
  title,
  description,
}: PageOpenGraphInput): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "pl_PL",
    siteName: SITE_NAME,
    url: path,
    title,
    description,
  };
}
