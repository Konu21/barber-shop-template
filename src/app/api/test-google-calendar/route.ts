import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/lib/config";
import { createBooking } from "@/app/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    // Protejează ruta de test - permite doar în development sau cu token special
    const isDevelopment = process.env.NODE_ENV === "development";
    const authHeader = request.headers.get("authorization");
    const testToken = process.env.TEST_API_TOKEN;

    if (
      !isDevelopment &&
      (!authHeader || authHeader !== `Bearer ${testToken}`)
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Test route protected" },
        { status: 401 }
      );
    }

    // Verifică configurația Google Calendar
    const googleConfig = {
      hasProjectId: !!config.GOOGLE_PROJECT_ID,
      hasPrivateKeyId: !!config.GOOGLE_PRIVATE_KEY_ID,
      hasPrivateKey: !!config.GOOGLE_PRIVATE_KEY,
      hasClientEmail: !!config.GOOGLE_CLIENT_EMAIL,
      hasClientId: !!config.GOOGLE_CLIENT_ID,
      hasCalendarId: !!config.GOOGLE_CALENDAR_ID,
      projectId: config.GOOGLE_PROJECT_ID,
      clientEmail: config.GOOGLE_CLIENT_EMAIL,
      calendarId: config.GOOGLE_CALENDAR_ID,
    };

    // Debug private key
    let privateKeyInfo = null;
    if (config.GOOGLE_PRIVATE_KEY) {
      const originalLength = config.GOOGLE_PRIVATE_KEY.length;
      const startsWith = config.GOOGLE_PRIVATE_KEY.substring(0, 50);
      const endsWith = config.GOOGLE_PRIVATE_KEY.substring(originalLength - 50);

      const formattedKey = config.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
        ?.replace(/\\"/g, '"')
        ?.replace(/^"|"$/g, "");

      privateKeyInfo = {
        originalLength,
        startsWith,
        endsWith,
        formattedLength: formattedKey?.length,
        formattedStartsWith: formattedKey?.substring(0, 50),
        formattedEndsWith: formattedKey?.substring(
          (formattedKey?.length || 0) - 50
        ),
        hasNewlines: config.GOOGLE_PRIVATE_KEY.includes("\\n"),
        hasQuotes: config.GOOGLE_PRIVATE_KEY.includes('"'),
      };
    }

    // Verifică dacă toate variabilele sunt setate
    const allConfigured =
      googleConfig.hasProjectId &&
      googleConfig.hasPrivateKeyId &&
      googleConfig.hasPrivateKey &&
      googleConfig.hasClientEmail &&
      googleConfig.hasClientId;

    // Test actual Google Calendar API call
    let testResult = null;
    if (allConfigured) {
      try {
        console.log("🧪 Testing actual Google Calendar API call...");
        console.log(
          "🧪 All config variables are present, proceeding with test..."
        );

        const testBooking = await createBooking({
          name: "Test Booking",
          phone: "123456789",
          email: "test@example.com",
          service: "Test Service",
          date: "2025-12-25", // Future date
          time: "10:00",
          notes: "Test booking for API verification",
        });

        testResult = {
          success: testBooking.success,
          message: testBooking.message,
          bookingId: testBooking.bookingId,
        };

        console.log("🧪 Test result:", testResult);
      } catch (error) {
        console.error("🧪 Test failed with error:", error);
        testResult = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        };
      }
    } else {
      console.log("🧪 Skipping test - not all config variables are present");
      testResult = {
        skipped: true,
        reason: "Not all Google Calendar config variables are present",
      };
    }

    return NextResponse.json({
      success: true,
      googleCalendarConfigured: allConfigured,
      config: googleConfig,
      privateKeyInfo,
      testResult,
      message: allConfigured
        ? "Google Calendar este configurat corect"
        : "Google Calendar nu este configurat complet",
    });
  } catch (error) {
    console.error("Error testing Google Calendar config:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Eroare la verificarea configurației Google Calendar",
      },
      { status: 500 }
    );
  }
}
