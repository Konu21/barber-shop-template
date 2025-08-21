import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBooking, updateBooking } from "@/app/lib/google-calendar";
import { sendBookingModificationEmail } from "@/app/lib/email-service";
import { sendNotification } from "@/app/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

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

    // Verifică dacă data/ora s-au schimbat
    const dateChanged =
      body.date && body.date !== booking.date.toISOString().split("T")[0];
    const timeChanged = body.time && body.time !== booking.time;
    const statusChanged = body.status && body.status !== booking.status;

    // Dacă data sau ora s-au schimbat, trimite email de propunere modificare
    if (dateChanged || timeChanged) {
      try {
        await sendBookingModificationEmail(
          {
            name: booking.client.name,
            phone: booking.client.phone,
            email: booking.client.email || "",
            service: booking.service.name,
            date: body.date || booking.date.toISOString().split("T")[0],
            time: body.time || booking.time,
            notes: body.notes || booking.notes || "",
          },
          bookingId,
          booking.date.toISOString().split("T")[0],
          booking.time,
          body.date || booking.date.toISOString().split("T")[0],
          body.time || booking.time
        );
        console.log("✅ Email de propunere modificare trimis către client");
      } catch (error) {
        console.error(
          "❌ Eroare la trimiterea email-ului de propunere modificare:",
          error
        );
      }
    }

    // Actualizează programarea în baza de date
    const updates: {
      date?: Date;
      time?: string;
      notes?: string;
      status?: "PENDING" | "CONFIRMED" | "CANCELLED";
    } = {};

    if (body.date) {
      updates.date = new Date(
        `${body.date}T${body.time || booking.time}:00+03:00`
      );
    }
    if (body.time) {
      updates.time = body.time;
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }
    if (body.status) {
      const validStatus = body.status.toUpperCase() as
        | "PENDING"
        | "CONFIRMED"
        | "CANCELLED";
      updates.status = validStatus;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updates,
      include: {
        client: true,
        service: true,
      },
    });

    // Dacă statusul este "CONFIRMED" și data/ora s-au schimbat, actualizează Google Calendar
    if (
      statusChanged &&
      body.status === "CONFIRMED" &&
      (dateChanged || timeChanged)
    ) {
      try {
        if (booking.googleCalendarId) {
          // Actualizează evenimentul existent
          await updateBooking(booking.googleCalendarId, {
            name: booking.client.name,
            phone: booking.client.phone,
            email: booking.client.email || "",
            service: booking.service.name,
            date: body.date || booking.date.toISOString().split("T")[0],
            time: body.time || booking.time,
            notes: body.notes || booking.notes || "",
          });
          console.log("✅ Eveniment actualizat în Google Calendar");
        } else {
          // Creează un nou eveniment
          const calendarEvent = await createBooking({
            name: booking.client.name,
            phone: booking.client.phone,
            email: booking.client.email || "",
            service: booking.service.name,
            date: body.date || booking.date.toISOString().split("T")[0],
            time: body.time || booking.time,
            notes: body.notes || booking.notes || "",
          });

          // Actualizează cu ID-ul din Google Calendar
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              googleCalendarId: calendarEvent.bookingId,
              lastSyncAt: new Date(),
              syncStatus: "SYNCED",
            },
          });
          console.log("✅ Eveniment nou creat în Google Calendar");
        }
      } catch (error) {
        console.error("❌ Eroare la actualizarea Google Calendar:", error);
        // Marchează ca out of sync
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            syncStatus: "FAILED",
          },
        });
      }
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

    return NextResponse.json({
      success: true,
      message: "Programarea a fost actualizată cu succes!",
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status.toLowerCase(),
        date: updatedBooking.date.toISOString().split("T")[0],
        time: updatedBooking.time,
      },
    });
  } catch (error) {
    console.error("Eroare la actualizarea programării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
