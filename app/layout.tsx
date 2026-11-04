import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAdsTag } from "@/components/analytics/GoogleAdsTag";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/mobile/MobileTabBar";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
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
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0b",
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
    <html lang="pl" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <GoogleAdsTag />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
