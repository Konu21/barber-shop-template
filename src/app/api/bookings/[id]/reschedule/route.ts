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
    // console.log("🔄 Reschedule request started");
    const { id: bookingId } = await params;
    // console.log("📋 Booking ID:", bookingId);
    const body = await request.json();
    // console.log("📦 Request body:", body);

    // Găsește programarea în baza de date
    // console.log("🔍 Searching for booking in database...");
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
      },
    });

    if (!booking) {
      // console.log("❌ Booking not found");
      return NextResponse.json(
        { success: false, error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }
    // console.log("✅ Booking found:", {id: booking.id,status: booking.status,date: booking.date,time: booking.time,clientName: booking.client.name,serviceName: booking.service.name,});

    // Verifică dacă data/ora s-au schimbat
    const dateChanged =
      body.date && body.date !== booking.date.toISOString().split("T")[0];
    const timeChanged = body.time && body.time !== booking.time;
    const statusChanged = body.status && body.status !== booking.status;

    // console.log("🔄 Change detection:", { dateChanged, timeChanged, statusChanged, currentDate: booking.date.toISOString().split("T")[0], newDate: body.date, currentTime: booking.time, newTime: body.time, currentStatus: booking.status, newStatus: body.status,});

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
        // console.log("✅ Email de propunere modificare trimis către client");
      } catch (error) {
        console.error(
          "❌ Eroare la trimiterea email-ului de propunere modificare:",
          error
        );
      }
    }

    // Actualizează programarea în baza de date
    // console.log("📝 Preparing database updates...");
    const updates: {
      date?: Date;
      time?: string;
      notes?: string;
      status?: any; // Folosim any pentru a evita problemele cu tipurile
    } = {};

    if (body.date) {
      updates.date = new Date(
        `${body.date}T${body.time || booking.time}:00+03:00`
      );
      // console.log("📅 Date update:", updates.date);
    }
    if (body.time) {
      updates.time = body.time;
      // console.log("⏰ Time update:", updates.time);
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes;
      // console.log("📝 Notes update:", updates.notes);
    }

    // Setează statusul intermediar dacă programarea era confirmată și se propune o modificare
    if (booking.status === "CONFIRMED" && (dateChanged || timeChanged)) {
      // Testează dacă enum-ul RESCHEDULE_PROPOSED este disponibil
      try {
        // Încearcă să creezi o programare de test cu RESCHEDULE_PROPOSED
        const testBooking = await prisma.booking.create({
          data: {
            clientId: booking.clientId,
            serviceId: booking.serviceId,
            date: new Date("2025-01-01T10:00:00+03:00"),
            time: "10:00",
            status: "RESCHEDULE_PROPOSED" as any,
            notes: "Test booking pentru enum",
          },
        });

        // Șterge programarea de test
        await prisma.booking.delete({
          where: { id: testBooking.id },
        });

        // Enum-ul funcționează, folosește-l
        updates.status = "RESCHEDULE_PROPOSED";
        // console.log("🔄 Programare confirmată cu propunere de reprogramare");
      } catch (error) {
        // Enum-ul nu funcționează, folosește PENDING ca fallback
        // console.log(
        //   "⚠️ RESCHEDULE_PROPOSED nu este disponibil, folosesc PENDING ca fallback"
        // );
        updates.status = "PENDING";
      }
    } else if (body.status) {
      updates.status = body.status.toUpperCase();
    }

    // console.log("📋 Final updates object:", updates);

    // console.log("💾 Updating booking in database...");
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updates,
      include: {
        client: true,
        service: true,
      },
    });
    // console.log("✅ Booking updated successfully:", {id: updatedBooking.id,status: updatedBooking.status,date: updatedBooking.date,time: updatedBooking.time,});

    // Dacă statusul este "CONFIRMED" și data/ora s-au schimbat, actualizează Google Calendar
    // Nu sincronizăm cu Google Calendar când statusul devine RESCHEDULE_PROPOSED
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
          // console.log("✅ Eveniment actualizat în Google Calendar");
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
          // console.log("✅ Eveniment nou creat în Google Calendar");
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
      // console.log("✅ Notificare trimisă către dashboard");
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
    console.error("❌ Eroare la actualizarea programării:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown error type",
    });
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
