import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/mobile/MobileTabBar";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { BRAND_NAME } from "@/lib/brand/constants";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import "katex/dist/katex.min.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const DEFAULT_TITLE =
  "Szybka Matematyka — matura i egzamin ósmoklasisty online";
const DEFAULT_DESCRIPTION =
  "Platforma do nauki matematyki: arkusze CKE, baza zadań z rozwiązaniami, trening tematyczny, minigry i rankingi — matura i egzamin 8-klasisty.";

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
    "szybka matematyka",
    "matura z matematyki",
    "egzamin ósmoklasisty",
    "egzamin 8-klasisty",
    "CKE",
    "arkusze maturalne",
    "zadania z matematyki",
    "nauka matematyki online",
    BRAND_NAME,
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
  },
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
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f14",
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
    <html lang="pl" className={`${jakarta.variable} dark h-full`}>
      <body className="flex min-h-full flex-col bg-[#0a0f14] font-sans text-slate-100 antialiased">
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
          <div className="absolute -left-[12%] top-0 h-[min(520px,58vw)] w-[min(520px,58vw)] rounded-full bg-teal-700/10 blur-[140px]" />
          <div className="absolute -right-[10%] top-1/4 h-[min(440px,50vw)] w-[min(440px,50vw)] rounded-full bg-sky-800/8 blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 h-[min(360px,42vw)] w-[min(360px,42vw)] rounded-full bg-teal-600/8 blur-[120px]" />
        </div>
        <Providers>
          <Navbar />
          <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col px-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:px-6 md:px-8 lg:px-10 lg:pb-0 xl:px-12 2xl:px-16">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
