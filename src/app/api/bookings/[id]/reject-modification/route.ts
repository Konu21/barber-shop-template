import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    // console.log("❌ Respingere modificare pentru booking ID:", bookingId);

    // Găsește programarea în baza de date
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
      },
    });

    // console.log("📋 Booking găsit:",booking ? {id: booking.id,status: booking.status,clientName: booking.client.name,date: booking.date,time: booking.time,}: "Nu a fost găsit");

    if (!booking) {
      // console.log("❌ Booking nu a fost găsit în baza de date");
      return NextResponse.json(
        { success: false, error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Pentru respingerea modificării, șterge programarea din baza de date
    // și din Google Calendar dacă există
    // console.log("❌ Modificarea a fost respinsă de client - șterge programarea");

    // Șterge din Google Calendar dacă există
    if (booking.googleCalendarId) {
      try {
        // Import din google-calendar pentru a șterge evenimentul
        const { deleteBooking } = await import("@/app/lib/google-calendar");
        const result = await deleteBooking(booking.googleCalendarId);
        if (result.success) {
          // console.log("✅ Eveniment șters din Google Calendar");
        } else {
          console.error(
            "❌ Eroare la ștergerea din Google Calendar:",
            result.message
          );
        }
      } catch (error) {
        console.error("❌ Eroare la ștergerea din Google Calendar:", error);
      }
    }

    // Șterge programarea din baza de date
    await prisma.booking.delete({
      where: { id: bookingId },
    });
    // console.log("✅ Programarea ștearsă din baza de date");

    // Redirecționează către o pagină de respingere
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/booking/modification-rejected`
    );
  } catch (error) {
    console.error("Eroare la respingerea modificării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
