import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/app/lib/jwt-edge";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for the dashboard
  if (pathname.startsWith("/dashboard")) {
    // Skip login page
    if (pathname === "/dashboard/login") {
      return NextResponse.next();
    }

    // Check for JWT token in cookies first
    const cookieToken = request.cookies.get("dashboardToken")?.value;

    // Also check for Authorization header (for API calls)
    const authHeader = request.headers.get("authorization");
    const headerToken = authHeader?.replace("Bearer ", "");

    const token = cookieToken || headerToken;

    if (!token) {
      // Redirect to login if no token
      // console.log("🔍 No token found, redirecting to login");
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }

    try {
      // Verify the token
      const decoded = verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      );

      // console.log("✅ Token valid, allowing access to dashboard");
      // Allow access to dashboard
      return NextResponse.next();
    } catch (error) {
      // console.log("❌ Token invalid, redirecting to login:", error);
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
