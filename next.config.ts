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
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@prisma/client", "nodemailer"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Enable modern JavaScript features
    esmExternals: "loose",
    // Optimize bundle splitting
    bundlePagesExternals: true,
  },

  // Bundle analyzer for optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
          },
          // Separate React and Next.js chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 20,
          },
          next: {
            test: /[\\/]node_modules[\\/](next)[\\/]/,
            name: "next",
            chunks: "all",
            priority: 15,
          },
          // Separate large libraries
          utils: {
            test: /[\\/]node_modules[\\/](lodash|moment|date-fns)[\\/]/,
            name: "utils",
            chunks: "all",
            priority: 8,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Enable modern JavaScript features
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Remove console.logs in production
    if (!dev) {
      config.optimization.minimizer.push(
        new (require("terser-webpack-plugin"))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        })
      );
    }

    return config;
  },

  // Development configuration
  ...(process.env.NODE_ENV !== "production" && {
    // Disable HTTPS redirects in development
    async redirects() {
      return [];
    },
  }),

  // Disable Edge Runtime for API routes to avoid Prisma compatibility issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },

  // Headers de securitate și optimizare
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    // Skip all security headers in development to avoid SSL issues
    if (!isProduction) {
      return [];
    }

    const baseHeaders = [
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
    ];

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
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
      // Optimize static assets with longer cache
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Optimize images with longer cache
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|webp|avif|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Optimize fonts with longer cache
      {
        source: "/(.*)\\.(woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Optimize CSS and JS with longer cache
      {
        source: "/(.*)\\.(css|js)",
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

  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
