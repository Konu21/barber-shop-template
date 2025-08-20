import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { config as appConfig } from "@/app/lib/config";
import { verify } from "@/app/lib/jwt-edge";

// Rate limiting store (în producție folosește Redis)
const rateLimitStore = new Map();

// Rate limiting function
function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip);
  const validRequests = requests.filter(
    (timestamp: number) => timestamp > windowStart
  );

  if (validRequests.length >= limit) {
    return false;
  }

  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  return true;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.googleapis.com;"
  );

  // Rate limiting pentru API endpoints
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip, 100, 15 * 60 * 1000)) {
      // 100 requests per 15 minutes
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Dashboard authentication
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Exclude pagina de login și API endpoints
    if (
      request.nextUrl.pathname === "/dashboard/login" ||
      request.nextUrl.pathname.startsWith("/api/")
    ) {
      return response;
    }

    // Verifică token-ul din cookie sau header
    const token =
      request.cookies.get("dashboardToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    console.log("🔍 Checking dashboard access for:", request.nextUrl.pathname);
    console.log("🍪 Token present:", !!token);
    console.log(
      "🔑 JWT_SECRET from config:",
      appConfig.JWT_SECRET ? "SET" : "NOT SET"
    );

    if (!token) {
      // Redirect către login dacă nu există token
      console.log("❌ No token found, redirecting to login");
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }

    // Verifică validitatea token-ului folosind Edge Runtime JWT
    return verify(token, appConfig.JWT_SECRET)
      .then((decoded) => {
        console.log("✅ Token valid, allowing access");
        console.log("👤 Decoded token:", decoded);

        // Adaugă informațiile utilizatorului în headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user", JSON.stringify(decoded));

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      })
      .catch((error) => {
        // Token invalid, redirect către login
        console.log("❌ Invalid token, redirecting to login");
        console.log("💥 JWT Error:", error);
        const redirectResponse = NextResponse.redirect(
          new URL("/dashboard/login", request.url)
        );
        redirectResponse.cookies.delete("dashboardToken");
        return redirectResponse;
      });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
