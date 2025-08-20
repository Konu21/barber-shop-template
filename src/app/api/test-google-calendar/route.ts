import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/lib/config";

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      googleCalendarConfigured: allConfigured,
      config: googleConfig,
      privateKeyInfo,
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
