import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
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
