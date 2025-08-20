import { google } from "googleapis";
import { getAllBookings } from "./bookings-storage";
import { config } from "./config";

// Configurare Google Calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Inițializare Google Auth cu variabile de mediu
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: config.GOOGLE_PROJECT_ID,
    private_key_id: config.GOOGLE_PRIVATE_KEY_ID,
    private_key: config.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: config.GOOGLE_CLIENT_EMAIL,
    client_id: config.GOOGLE_CLIENT_ID,
  },
  scopes: SCOPES,
});

// Inițializare Calendar API
const calendar = google.calendar({ version: "v3", auth });

// Adaugă această constantă la începutul fișierului
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

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
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // Începe la 9:00

    const endOfDay = new Date(date);
    endOfDay.setHours(19, 0, 0, 0); // Se termină la 19:00

    // Obține evenimentele din calendar pentru ziua respectivă
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID, // în loc de "primary"
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const googleEvents = response.data.items || [];

    // Obține programările confirmate din stocarea locală pentru aceeași zi
    const localBookings = getAllBookings("confirmed").filter((booking) => {
      return booking.date === date;
    });

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
    console.log("🔍 Google Calendar - Începe crearea programării:", booking);

    const startTime = new Date(`${booking.date}T${booking.time}:00`);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // Durata implicită 30 minute

    console.log("⏰ Google Calendar - Timp start:", startTime.toISOString());
    console.log("⏰ Google Calendar - Timp end:", endTime.toISOString());

    // Creează evenimentul în Google Calendar
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
      calendarId: CALENDAR_ID, // în loc de "primary"
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
    console.error("Error creating booking:", error);
    return {
      success: false,
      message: "Eroare la crearea programării",
    };
  }
}

// Funcție pentru a obține toate programările pentru o perioadă
export async function getBookings(startDate: string, endDate: string) {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID, // în loc de "primary"
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
    const event = await calendar.events.get({
      calendarId: CALENDAR_ID, // în loc de "primary"
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

    if (updates.date && updates.time) {
      const startTime = new Date(`${updates.date}T${updates.time}:00`);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      updatedEvent.start = {
        dateTime: startTime.toISOString(),
        timeZone: "Europe/Bucharest",
      };
      updatedEvent.end = {
        dateTime: endTime.toISOString(),
        timeZone: "Europe/Bucharest",
      };
    }

    await calendar.events.update({
      calendarId: CALENDAR_ID, // în loc de "primary"
      eventId: bookingId,
      requestBody: updatedEvent,
      sendUpdates: "all",
    });

    return {
      success: true,
      bookingId,
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
    await calendar.events.delete({
      calendarId: CALENDAR_ID, // în loc de "primary"
      eventId: bookingId,
      sendUpdates: "all",
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
