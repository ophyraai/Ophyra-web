import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://zqzysnzacwaivlxoiiab.supabase.co https://img.clerk.com https://i.pravatar.cc",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://zqzysnzacwaivlxoiiab.supabase.co https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://www.instagram.com https://www.tiktok.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      {
        protocol: "https",
        hostname: "zqzysnzacwaivlxoiiab.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
      {
        protocol: "https",
        hostname: "zqzysnzacwaivlxoiiab.supabase.co",
        pathname: "/storage/v1/object/public/diagnosis-photos/**",
      },
    ],
  },
  experimental: {
    // This helps mitigate Jest/Turbopack memory pressure in Next.js 15+
    memoryBasedWorkersCount: true
  }
};

export default withNextIntl(nextConfig);
