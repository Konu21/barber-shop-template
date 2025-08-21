import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/lib/config";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug Calendar Info Request");

    // Verifică autentificarea
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Informații despre configurația Google Calendar
    const debugInfo: any = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        IS_VERCEL: process.env.VERCEL === "1",
        IS_PRODUCTION: config.IS_PRODUCTION,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      googleConfig: {
        hasProjectId: !!config.GOOGLE_PROJECT_ID,
        projectId: config.GOOGLE_PROJECT_ID,
        hasPrivateKeyId: !!config.GOOGLE_PRIVATE_KEY_ID,
        privateKeyId: config.GOOGLE_PRIVATE_KEY_ID,
        hasServiceAccountEmail: !!config.GOOGLE_CLIENT_EMAIL,
        serviceAccountEmail: config.GOOGLE_CLIENT_EMAIL,
        hasClientId: !!config.GOOGLE_CLIENT_ID,
        clientId: config.GOOGLE_CLIENT_ID,
        hasPrivateKey: !!config.GOOGLE_PRIVATE_KEY,
        privateKeyLength: config.GOOGLE_PRIVATE_KEY?.length || 0,
        privateKeyFormat: (() => {
          const key = config.GOOGLE_PRIVATE_KEY;
          if (!key) return "Missing";

          // Check for proper format after processing
          const processed = key
            .replace(/^["']|["']$/g, "")
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .trim();

          const hasBegin = processed.includes("-----BEGIN PRIVATE KEY-----");
          const hasEnd = processed.includes("-----END PRIVATE KEY-----");
          const hasNewlines = processed.includes("\n");

          if (hasBegin && hasEnd && hasNewlines) return "Correct format";
          if (hasBegin && hasEnd && !hasNewlines) return "Missing newlines";
          return "Incorrect format";
        })(),
        hasCalendarId: !!config.GOOGLE_CALENDAR_ID,
        calendarId: config.GOOGLE_CALENDAR_ID,
      },
      timezone: {
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        nodeTimezone: process.env.TZ || "Not set",
        currentTime: new Date().toISOString(),
        romanianTime: new Date().toLocaleString("ro-RO", {
          timeZone: "Europe/Bucharest",
        }),
        utcTime: new Date().toUTCString(),
      },
    };

    // Încearcă să obții informații despre calendar
    try {
      // Setup Google Calendar client
      console.log("🔑 Debug: Private key format before processing:", {
        length: config.GOOGLE_PRIVATE_KEY?.length,
        startsWith: config.GOOGLE_PRIVATE_KEY?.substring(0, 30),
        hasNewlines: config.GOOGLE_PRIVATE_KEY?.includes("\\n"),
        hasRealNewlines: config.GOOGLE_PRIVATE_KEY?.includes("\n"),
      });

      // Fix private key formatting
      let formattedPrivateKey = config.GOOGLE_PRIVATE_KEY;
      if (formattedPrivateKey) {
        // Remove any outer quotes and fix newlines
        formattedPrivateKey = formattedPrivateKey
          .replace(/^["']|["']$/g, "") // Remove outer quotes
          .replace(/\\n/g, "\n") // Convert literal \n to actual newlines
          .replace(/\\"/g, '"') // Fix escaped quotes
          .trim();
      }

      console.log("🔑 Debug: Private key format after processing:", {
        length: formattedPrivateKey?.length,
        startsWith: formattedPrivateKey?.substring(0, 30),
        hasNewlines: formattedPrivateKey?.includes("\n"),
        endsCorrectly: formattedPrivateKey?.includes(
          "-----END PRIVATE KEY-----"
        ),
      });

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.GOOGLE_CLIENT_EMAIL,
          private_key: formattedPrivateKey,
        },
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });

      const calendar = google.calendar({ version: "v3", auth });

      // Get calendar details
      const calendarInfo = await calendar.calendars.get({
        calendarId: config.GOOGLE_CALENDAR_ID,
      });

      debugInfo.calendarDetails = {
        id: calendarInfo.data.id,
        summary: calendarInfo.data.summary,
        timeZone: calendarInfo.data.timeZone,
        description: calendarInfo.data.description,
        location: calendarInfo.data.location,
      };

      // Get today's events
      const today = new Date().toISOString().split("T")[0];
      const startOfDay = new Date(`${today}T09:00:00+03:00`);
      const endOfDay = new Date(`${today}T19:00:00+03:00`);

      console.log("🔍 Checking events for today:", {
        today,
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      });

      const eventsResponse = await calendar.events.list({
        calendarId: config.GOOGLE_CALENDAR_ID,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      debugInfo.todayEvents = {
        count: eventsResponse.data.items?.length || 0,
        events:
          eventsResponse.data.items?.map((event: any) => ({
            id: event.id,
            summary: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            status: event.status,
          })) || [],
      };
    } catch (error: any) {
      debugInfo.calendarError = {
        message: error.message || "Unknown error",
        status: error.status || "Unknown status",
        code: error.code || "Unknown code",
      };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error: any) {
    console.error("❌ Error in debug calendar:", error);
    return NextResponse.json(
      {
        error: "Failed to get debug info",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
