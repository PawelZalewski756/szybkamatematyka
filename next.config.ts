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

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
