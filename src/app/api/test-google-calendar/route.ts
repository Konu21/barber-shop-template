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
