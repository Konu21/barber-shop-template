import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBooking } from "@/app/lib/google-calendar";
import { sendBookingNotifications } from "@/app/lib/email-service";
import { sendNotification } from "@/app/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    // Găsește programarea în baza de date
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Programarea nu este în așteptare" },
        { status: 400 }
      );
    }

    // Creează evenimentul în Google Calendar
    let googleCalendarId = null;
    try {
      const calendarEvent = await createBooking({
        name: booking.client.name,
        phone: booking.client.phone,
        email: booking.client.email || "",
        service: booking.service.name,
        date: booking.date.toISOString().split("T")[0],
        time: booking.time,
        notes: booking.notes || "",
      });

      if (calendarEvent.success) {
        googleCalendarId = calendarEvent.bookingId;
      }
    } catch (error) {
      console.error(
        "❌ Eroare la crearea evenimentului în Google Calendar:",
        error
      );
      // Continuă fără Google Calendar dacă eșuează
    }

    // Actualizează programarea în baza de date
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        googleCalendarId: googleCalendarId,
        lastSyncAt: googleCalendarId ? new Date() : null,
        syncStatus: googleCalendarId ? "SYNCED" : "FAILED",
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Trimite notificare în timp real către dashboard
    try {
      sendNotification({
        type: "booking_updated",
        booking: {
          id: updatedBooking.id,
          clientName: updatedBooking.client.name,
          clientPhone: updatedBooking.client.phone,
          clientEmail: updatedBooking.client.email || "",
          service: updatedBooking.service.name,
          date: updatedBooking.date.toISOString().split("T")[0],
          time: updatedBooking.time,
          notes: updatedBooking.notes,
          status: "confirmed",
          createdAt: updatedBooking.createdAt.toISOString(),
          updatedAt: updatedBooking.updatedAt.toISOString(),
          googleCalendarId: updatedBooking.googleCalendarId,
        },
        message: "Programare aprobată!",
      });
      // console.log("✅ Notificare trimisă către dashboard");
    } catch (error) {
      console.error("❌ Eroare la trimiterea notificării:", error);
    }

    // Trimite email de confirmare către client după aprobare
    try {
      await sendBookingNotifications(
        {
          name: booking.client.name,
          phone: booking.client.phone,
          email: booking.client.email || "",
          service: booking.service.name,
          date: booking.date.toISOString().split("T")[0],
          time: booking.time,
          notes: booking.notes || "",
        },
        bookingId
      );
    } catch (error) {
      console.error("❌ Eroare la trimiterea email-ului:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Programarea a fost aprobată cu succes!",
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status.toLowerCase(),
        googleCalendarId: updatedBooking.googleCalendarId,
      },
    });
  } catch (error) {
    console.error("Eroare la aprobarea programării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
