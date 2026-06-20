import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import "katex/dist/katex.min.css";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

const DEFAULT_TITLE =
  "Szybka Matma — matura i egzamin ósmoklasisty w tempie gry";
const DEFAULT_DESCRIPTION =
  "Zgamifikowana platforma do nauki matematyki pod maturę i egzamin ósmoklasisty (CKE). Minigry, baza zadań z rozwiązaniami, arkusze, treningi tematyczne, pojedynki 1v1, rankingi i system EXP.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "matematyka",
    "matura z matematyki",
    "egzamin ósmoklasisty",
    "egzamin 8-klasisty",
    "CKE",
    "arkusze maturalne",
    "zadania z matematyki",
    "nauka matematyki online",
    "korepetycje matematyka",
    "matura podstawowa",
    "powtórka do matury",
    "Szybka Matma",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
  },
  // Brak `title`/`description` w openGraph/twitter jest celowy — Next.js
  // automatycznie uzupełnia je z rozwiązanego tytułu i opisu danej trasy,
  // dzięki czemu każda podstrona ma własne OG/Twitter bez powielania kodu.
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: "pl-PL",
  areaServed: "PL",
  knowsAbout: [
    "matematyka",
    "matura z matematyki",
    "egzamin ósmoklasisty",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${outfit.variable} dark h-full`}>
      <body className="flex min-h-full flex-col bg-zinc-950 font-sans text-zinc-100 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          aria-hidden
          style={{
            maskImage:
              "radial-gradient(ellipse 100% 70% at 50% 0%, #000 10%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 70% at 50% 0%, #000 10%, transparent 75%)",
          }}
        >
          <div className="absolute -left-[15%] top-0 h-[min(560px,60vw)] w-[min(560px,60vw)] rounded-full bg-fuchsia-600/15 blur-[140px]" />
          <div className="absolute -right-[12%] top-1/4 h-[min(480px,52vw)] w-[min(480px,52vw)] rounded-full bg-cyan-600/12 blur-[130px]" />
        </div>
        <Providers>
          <Navbar />
          <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
