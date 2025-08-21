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

    // Check for JWT token in cookies
    const token = request.cookies.get("dashboardToken")?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }

    try {
      // Verify the token
      const decoded = verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      );

      // Allow access to dashboard
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
