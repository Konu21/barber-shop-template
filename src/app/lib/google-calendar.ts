import { google } from "googleapis";
import { getAllBookings } from "./bookings-storage";
import { config } from "./config";

// Configurare Google Calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Verifică dacă toate variabilele Google Calendar sunt setate
const hasGoogleConfig =
  config.GOOGLE_PROJECT_ID &&
  config.GOOGLE_PRIVATE_KEY_ID &&
  config.GOOGLE_PRIVATE_KEY &&
  config.GOOGLE_CLIENT_EMAIL &&
  config.GOOGLE_CLIENT_ID;

// Debug private key formatting
if (config.GOOGLE_PRIVATE_KEY) {
  console.log(
    "🔑 Original private key length:",
    config.GOOGLE_PRIVATE_KEY.length
  );
  console.log(
    "🔑 Private key starts with:",
    config.GOOGLE_PRIVATE_KEY.substring(0, 50)
  );
  console.log(
    "🔑 Private key ends with:",
    config.GOOGLE_PRIVATE_KEY.substring(config.GOOGLE_PRIVATE_KEY.length - 50)
  );

  const formattedKey = config.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    ?.replace(/\\"/g, '"')
    ?.replace(/^"|"$/g, "");

  console.log("🔑 Formatted private key length:", formattedKey?.length);
  console.log("🔑 Formatted key starts with:", formattedKey?.substring(0, 50));
  console.log(
    "🔑 Formatted key ends with:",
    formattedKey?.substring((formattedKey?.length || 0) - 50)
  );
}

// Format private key properly
let formattedPrivateKey = config.GOOGLE_PRIVATE_KEY;
if (formattedPrivateKey) {
  formattedPrivateKey = formattedPrivateKey
    .replace(/^["']|["']$/g, "") // Remove outer quotes
    .replace(/\\n/g, "\n") // Convert literal \n to actual newlines
    .replace(/\\"/g, '"') // Fix escaped quotes
    .trim();
}

// Inițializare Google Auth cu variabile de mediu
const auth = hasGoogleConfig
  ? new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: config.GOOGLE_PROJECT_ID,
        private_key_id: config.GOOGLE_PRIVATE_KEY_ID,
        private_key: formattedPrivateKey,
        client_email: config.GOOGLE_CLIENT_EMAIL,
        client_id: config.GOOGLE_CLIENT_ID,
      },
      scopes: SCOPES,
    })
  : null;

// Inițializare Calendar API
const calendar = auth ? google.calendar({ version: "v3", auth }) : null;

// Adaugă această constantă la începutul fișierului
const CALENDAR_ID = config.GOOGLE_CALENDAR_ID;

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface BookingRequest {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message: string;
}

// Funcție pentru a obține disponibilitatea pentru o zi
export async function getAvailabilityForDate(
  date: string
): Promise<TimeSlot[]> {
  try {
    // Folosește timezone-ul României (Europe/Bucharest)
    const startOfDay = new Date(`${date}T09:00:00+03:00`); // 9:00 AM EEST
    const endOfDay = new Date(`${date}T19:00:00+03:00`); // 7:00 PM EEST

    let googleEvents: any[] = [];

    // Verifică dacă Google Calendar este configurat
    if (calendar && hasGoogleConfig) {
      try {
        // Obține evenimentele din calendar pentru ziua respectivă
        const response = await calendar.events.list({
          calendarId: CALENDAR_ID,
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });

        googleEvents = response.data.items || [];
      } catch (googleError) {
        console.warn(
          "Google Calendar not available, using local bookings only:",
          googleError
        );
        googleEvents = [];
      }
    } else {
      console.log("Google Calendar not configured, using local bookings only");
    }

    // Obține programările confirmate din stocarea locală pentru aceeași zi
    // Skip local bookings in serverless environment to avoid file system issues
    const isServerless =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    let localBookings: any[] = [];

    if (!isServerless) {
      try {
        localBookings = getAllBookings("confirmed").filter((booking) => {
          return booking.date === date;
        });
      } catch (error) {
        console.warn(
          "Could not get local bookings, using Google Calendar only:",
          error
        );
        localBookings = [];
      }
    }

    // Combină evenimentele din Google Calendar cu programările locale confirmate
    const allEvents = [
      ...googleEvents,
      ...localBookings.map((booking) => ({
        start: {
          dateTime: new Date(
            `${booking.date}T${booking.time}:00`
          ).toISOString(),
        },
        end: {
          dateTime: new Date(
            `${booking.date}T${booking.time}:00`
          ).toISOString(),
        },
      })),
    ];

    // Generează sloturile de timp (30 minute fiecare)
    const timeSlots: TimeSlot[] = [];
    const slotDuration = 30; // minute

    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Verifică dacă slotul este disponibil
        const isAvailable = !allEvents.some((event) => {
          const eventStart = new Date(
            (event.start as { dateTime?: string; date?: string })?.dateTime ||
              (event.start as { dateTime?: string; date?: string })?.date ||
              ""
          );
          const eventEnd = new Date(
            (event.end as { dateTime?: string; date?: string })?.dateTime ||
              (event.end as { dateTime?: string; date?: string })?.date ||
              ""
          );

          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (slotStart <= eventStart && slotEnd >= eventEnd)
          );
        });

        timeSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: isAvailable,
        });
      }
    }

    return timeSlots;
  } catch (error) {
    console.error("Error getting availability:", error);
    throw new Error("Failed to get availability");
  }
}

// Funcție pentru a crea o programare
export async function createBooking(
  booking: BookingRequest
): Promise<BookingResponse> {
  try {
    console.log(
      "🔍 createBooking - Începe crearea programării în Google Calendar"
    );
    console.log("📋 Detalii programare:", booking);
    console.log("🔧 Google Calendar configurat:", hasGoogleConfig);
    console.log("📅 Calendar ID:", CALENDAR_ID);
    console.log("📅 Calendar ID from config:", config.GOOGLE_CALENDAR_ID);
    console.log("📅 Calendar ID from env:", process.env.GOOGLE_CALENDAR_ID);
    console.log("🔑 Auth disponibil:", !!auth);
    console.log("📅 Calendar API disponibil:", !!calendar);

    // Verifică dacă Google Calendar este configurat
    if (!calendar || !hasGoogleConfig) {
      console.log(
        "❌ Google Calendar not configured, creating local booking only"
      );
      return {
        success: true,
        message:
          "Programarea a fost creată local (Google Calendar nu este configurat)",
      };
    }

    const startTime = new Date(`${booking.date}T${booking.time}:00+03:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minute

    console.log("⏰ Start time:", startTime.toISOString());
    console.log("⏰ End time:", endTime.toISOString());

    const event = {
      summary: `Programare - ${booking.name}`,
      description: `
Serviciu: ${booking.service}
Telefon: ${booking.phone}
Email: ${booking.email || "N/A"}
Note: ${booking.notes || "N/A"}
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      // Nu folosim attendees pentru service account - trimitem email-ul prin sistemul nostru
      // attendees: [{ email: booking.email }].filter(
      //   (attendee) => attendee.email
      // ),
      extendedProperties: {
        private: {
          status: "confirmed",
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 ore înainte
          { method: "popup", minutes: 30 }, // 30 minute înainte
        ],
      },
    };

    console.log("📅 Google Calendar - Eveniment de creat:", event);

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
      sendUpdates: "none", // Nu trimitem notificări prin Google Calendar
    });

    console.log("✅ Google Calendar - Răspuns API:", response.data);
    const bookingId = response.data.id || "";
    console.log("🆔 Google Calendar - ID Programare:", bookingId);

    return {
      success: true,
      bookingId,
      message: "Programarea a fost creată cu succes!",
    };
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      status: (error as any)?.status,
      stack: error instanceof Error ? error.stack : undefined,
      library: (error as any)?.library,
      reason: (error as any)?.reason,
    });

    // Provide more specific error messages
    let errorMessage = "Eroare la crearea programării";
    if (error instanceof Error) {
      if (error.message.includes("DECODER routines")) {
        errorMessage =
          "Eroare de configurare Google Calendar - cheia privată nu este validă";
      } else if (error.message.includes("unauthorized")) {
        errorMessage =
          "Eroare de autorizare Google Calendar - verifică credențialele";
      } else if (error.message.includes("notFound")) {
        errorMessage = "Calendar Google nu a fost găsit - verifică Calendar ID";
      } else {
        errorMessage = `Eroare Google Calendar: ${error.message}`;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Funcție pentru a obține toate programările pentru o perioadă
export async function getBookings(startDate: string, endDate: string) {
  try {
    if (!calendar || !hasGoogleConfig) {
      console.log("Google Calendar not configured, returning empty array");
      return [];
    }

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw new Error("Failed to get bookings");
  }
}

// Funcție pentru a actualiza o programare
export async function updateBooking(
  bookingId: string,
  updates: Partial<BookingRequest>
): Promise<BookingResponse> {
  try {
    if (!calendar || !hasGoogleConfig) {
      return {
        success: false,
        message: "Google Calendar nu este configurat",
      };
    }

    const event = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: bookingId,
    });

    if (!event.data) {
      return {
        success: false,
        message: "Programarea nu a fost găsită",
      };
    }

    // Actualizează evenimentul
    const updatedEvent = {
      ...event.data,
      summary: updates.name
        ? `Programare - ${updates.name}`
        : event.data.summary,
      description: `
Serviciu: ${updates.service || "N/A"}
Telefon: ${updates.phone || "N/A"}
Email: ${updates.email || "N/A"}
Note: ${updates.notes || "N/A"}
      `.trim(),
    };

    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: bookingId,
      requestBody: updatedEvent,
      sendUpdates: "none",
    });

    return {
      success: true,
      message: "Programarea a fost actualizată cu succes!",
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    return {
      success: false,
      message: "Eroare la actualizarea programării",
    };
  }
}

// Funcție pentru a șterge o programare
export async function deleteBooking(
  bookingId: string
): Promise<BookingResponse> {
  try {
    if (!calendar || !hasGoogleConfig) {
      return {
        success: false,
        message: "Google Calendar nu este configurat",
      };
    }

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: bookingId,
    });

    return {
      success: true,
      message: "Programarea a fost ștearsă cu succes!",
    };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return {
      success: false,
      message: "Eroare la ștergerea programării",
    };
  }
}
