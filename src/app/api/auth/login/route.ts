import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/lib/config";
import { sign } from "@/app/lib/jwt-edge";

// Rate limiting pentru login
const loginAttempts = new Map();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  const recentAttempts = attempts.filter(
    (timestamp: number) => now - timestamp < 15 * 60 * 1000
  ); // 15 minute

  if (recentAttempts.length >= 5) {
    // Max 5 încercări în 15 minute
    return false;
  }

  recentAttempts.push(now);
  loginAttempts.set(ip, recentAttempts);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Login attempt received");

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    console.log(" IP:", ip);

    // Rate limiting pentru login
    if (!checkLoginRateLimit(ip)) {
      console.log("⚠️ Rate limit exceeded for IP:", ip);
      return NextResponse.json(
        {
          success: false,
          message:
            "Prea multe încercări de autentificare. Încearcă din nou în 15 minute.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log("📝 Request body:", {
      username: body.username,
      password: body.password ? "***" : "missing",
    });

    const { username, password } = body;

    // Validare input
    if (
      !username ||
      !password ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      console.log("❌ Invalid input:", {
        username: !!username,
        password: !!password,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Date invalide",
        },
        { status: 400 }
      );
    }

    // Verifică lungimea input-ului
    if (username.length > 50 || password.length > 100) {
      console.log("❌ Input too long:", {
        usernameLength: username.length,
        passwordLength: password.length,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Date prea lungi",
        },
        { status: 400 }
      );
    }

    console.log("🔑 Checking credentials...");
    console.log("Expected username:", config.DASHBOARD_USERNAME);
    console.log("Provided username:", username);
    console.log("Password match:", password === config.DASHBOARD_PASSWORD);

    // Verifică credențialele
    if (
      username === config.DASHBOARD_USERNAME &&
      password === config.DASHBOARD_PASSWORD
    ) {
      console.log("✅ Credentials valid, generating token...");

      // Generează JWT token cu expirare mai scurtă
      const token = await sign(
        {
          username,
          role: "admin",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 ore în loc de 24
        },
        config.JWT_SECRET || "fallback-secret"
      );

      console.log("🎫 Token generated successfully");

      // Setează cookie securizat
      const response = NextResponse.json({
        success: true,
        token,
        message: "Autentificare reușită",
      });

      // Cookie securizat
      response.cookies.set("dashboardToken", token, {
        httpOnly: true,
        secure: config.IS_PRODUCTION,
        sameSite: "strict",
        maxAge: 4 * 60 * 60, // 4 ore
        path: "/",
      });

      console.log("✅ Login successful, redirecting...");
      return response;
    } else {
      console.log("❌ Invalid credentials");
      return NextResponse.json(
        {
          success: false,
          message: "Username sau parolă incorecte",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("💥 Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Eroare la autentificare",
      },
      { status: 500 }
    );
  }
}
