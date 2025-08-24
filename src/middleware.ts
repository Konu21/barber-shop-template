import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateCSPHeader, securityHeaders } from "@/lib/security-config";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Skip security headers in development to avoid SSL issues
  if (process.env.NODE_ENV === "development") {
    return response;
  }

  // Generează CSP header din configurație
  const cspHeader = generateCSPHeader();

  // Aplică headers de securitate
  response.headers.set("Content-Security-Policy", cspHeader);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
