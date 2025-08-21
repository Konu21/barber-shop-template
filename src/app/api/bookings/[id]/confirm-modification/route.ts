import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBooking } from "@/app/lib/google-calendar";
import { sendBookingNotifications } from "@/app/lib/email-service";
import { sendNotification } from "@/app/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { searchParams } = new URL(request.url);
    const newDate = searchParams.get("date");
    const newTime = searchParams.get("time");

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

    // Actualizează programarea cu noua dată și oră din parametrii URL
    if (!newDate || !newTime) {
      return NextResponse.json(
        { success: false, error: "Data și ora sunt obligatorii" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: new Date(`${newDate}T${newTime}:00`),
        time: newTime,
        status: "CONFIRMED", // Confirmă programarea după modificare
        syncStatus: "SYNCED", // Resetează sync status
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Actualizează Google Calendar dacă există
    if (booking.googleCalendarId) {
      try {
        await updateBooking(booking.googleCalendarId, {
          name: booking.client.name,
          phone: booking.client.phone,
          email: booking.client.email || "",
          service: booking.service.name,
          date: newDate,
          time: newTime,
          notes: booking.notes || "",
        });
        console.log("✅ Eveniment actualizat în Google Calendar");
      } catch (error) {
        console.error("❌ Eroare la actualizarea Google Calendar:", error);
      }
    }

    // Trimite email de confirmare către client
    try {
      await sendBookingNotifications(
        {
          name: booking.client.name,
          phone: booking.client.phone,
          email: booking.client.email || "",
          service: booking.service.name,
          date: newDate,
          time: newTime,
          notes: booking.notes || "",
        },
        bookingId
      );
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
          status: updatedBooking.status.toLowerCase(),
          createdAt: updatedBooking.createdAt.toISOString(),
          updatedAt: updatedBooking.updatedAt.toISOString(),
        },
      });
      console.log("✅ Notificare trimisă către dashboard");
    } catch (error) {
      console.error("❌ Eroare la trimiterea notificării:", error);
    }

    // Redirecționează către o pagină de succes
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/booking/modification-confirmed`
    );
  } catch (error) {
    console.error("Eroare la confirmarea modificării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
