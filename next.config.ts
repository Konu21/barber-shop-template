import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@prisma/client", "nodemailer"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Disable Edge Runtime for API routes to avoid Prisma compatibility issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },

  // Headers de securitate
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;",
          },
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Configurare pentru producție
  output: "standalone",
  poweredByHeader: false,
  generateEtags: false,

  // Compresie și optimizare
  compress: true,

  // Bundle analyzer (doar în development)
  ...(process.env.ANALYZE === "true" && {
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ["@prisma/client", "nodemailer"],
      serverActions: {
        bodySizeLimit: "2mb",
      },
    },
  }),
};

export default nextConfig;
