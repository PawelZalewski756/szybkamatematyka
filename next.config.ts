import type { NextConfig } from "next";

function supabaseStorageRemotePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const hostname = new URL(raw).hostname;
    return {
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return undefined;
  }
}

const storagePattern = supabaseStorageRemotePattern();

/**
 * Nagłówki bezpieczeństwa.
 *
 * CSP startuje w trybie `Report-Only`: aplikacja używa inline skryptów Next
 * (theme init, JSON-LD, gtag), więc wymuszenie polityki bez nonce zepsułoby
 * stronę. Report-Only zbiera naruszenia, a po 1–2 tygodniach można przejść na
 * `Content-Security-Policy`. Pozostałe nagłówki są wymuszane od razu.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
  "frame-src https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: CONTENT_SECURITY_POLICY,
          },
        ],
      },
    ];
  },
  images: storagePattern
    ? {
        remotePatterns: [storagePattern],
      }
    : undefined,
  outputFileTracingIncludes: {
    "/api/trening/tasks": ["./data/tasks-cache/**/*"],
    "/api/trening/task-assist": ["./data/tasks-cache/**/*"],
  },
};

export default nextConfig;
