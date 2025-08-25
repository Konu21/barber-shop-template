import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add performance headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Fix MIME type issues for CSS files
  if (request.nextUrl.pathname.endsWith(".css")) {
    response.headers.set("Content-Type", "text/css");
  }

  // Fix MIME type issues for JS files
  if (request.nextUrl.pathname.endsWith(".js")) {
    response.headers.set("Content-Type", "application/javascript");
  }

  // Optimize caching for static assets
  if (
    request.nextUrl.pathname.match(
      /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2|ttf|eot|css|js)$/
    )
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Optimize caching for Next.js static files
  if (request.nextUrl.pathname.startsWith("/_next/static/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Add security headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;"
    );
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
