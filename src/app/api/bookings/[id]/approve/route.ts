import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBooking } from "@/app/lib/google-calendar";
import { sendBookingApprovalEmail } from "@/app/lib/email-service";

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
      console.log("🔍 Începe crearea evenimentului în Google Calendar...");
      console.log("📋 Detalii programare:", {
        name: booking.client.name,
        phone: booking.client.phone,
        email: booking.client.email || "",
        service: booking.service.name,
        date: booking.date.toISOString().split("T")[0],
        time: booking.time,
        notes: booking.notes || "",
      });

      const calendarEvent = await createBooking({
        name: booking.client.name,
        phone: booking.client.phone,
        email: booking.client.email || "",
        service: booking.service.name,
        date: booking.date.toISOString().split("T")[0],
        time: booking.time,
        notes: booking.notes || "",
      });

      console.log("📅 Răspuns createBooking:", calendarEvent);

      if (calendarEvent.success) {
        googleCalendarId = calendarEvent.bookingId;
        console.log("✅ Eveniment creat în Google Calendar:", googleCalendarId);
      } else {
        console.log(
          "❌ createBooking a returnat success: false:",
          calendarEvent.message
        );
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

    // Trimite email de aprobare
    try {
      await sendBookingApprovalEmail(
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
      console.log("✅ Email de aprobare trimis");
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
