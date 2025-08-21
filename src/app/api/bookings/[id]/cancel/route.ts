import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteBooking } from "@/app/lib/google-calendar";
import { sendBookingCancellationEmail } from "@/app/lib/email-service";
import { sendNotification } from "@/app/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    console.log("🔍 Anulare programare - ID primit:", bookingId);

    // Găsește programarea în baza de date
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
      },
    });

    console.log("🔍 Programare găsită:", booking ? "DA" : "NU");
    if (booking) {
      console.log("📋 Status programare:", booking.status);
      console.log("📋 Detalii programare:", {
        id: booking.id,
        status: booking.status,
        clientName: booking.client.name,
        serviceName: booking.service.name,
        date: booking.date,
        time: booking.time,
      });
    }

    if (!booking) {
      console.log("❌ Programarea nu a fost găsită pentru ID:", bookingId);
      return NextResponse.json(
        { success: false, error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED") {
      console.log(
        "❌ Programarea este deja anulată. Status actual:",
        booking.status
      );
      return NextResponse.json(
        { success: false, error: "Programarea este deja anulată" },
        { status: 400 }
      );
    }

    // Șterge din Google Calendar dacă există
    if (booking.googleCalendarId) {
      try {
        await deleteBooking(booking.googleCalendarId);
        console.log(
          "✅ Eveniment șters din Google Calendar:",
          booking.googleCalendarId
        );
      } catch (error) {
        console.error("❌ Eroare la ștergerea din Google Calendar:", error);
        // Continuă fără Google Calendar dacă eșuează
      }
    }

    // Actualizează programarea în baza de date
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        syncStatus: "OUT_OF_SYNC",
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Trimite email de anulare
    try {
      await sendBookingCancellationEmail(
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
      console.log("✅ Email de anulare trimis");
    } catch (error) {
      console.error("❌ Eroare la trimiterea email-ului:", error);
    }

    // Trimite notificare către dashboard pentru actualizare
    try {
      sendNotification({
        type: "booking_updated",
        booking: {
          id: updatedBooking.id,
          clientName: updatedBooking.client.name,
          clientPhone: updatedBooking.client.phone,
          clientEmail: updatedBooking.client.email,
          service: updatedBooking.service.name,
          date: updatedBooking.date.toISOString().split("T")[0],
          time: updatedBooking.time,
          notes: updatedBooking.notes,
          status: "cancelled",
          createdAt: updatedBooking.createdAt.toISOString(),
          updatedAt: updatedBooking.updatedAt.toISOString(),
        },
      });
      console.log("✅ Notificare trimisă către dashboard");
    } catch (error) {
      console.error("❌ Eroare la trimiterea notificării:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Programarea a fost anulată cu succes!",
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Eroare la anularea programării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
