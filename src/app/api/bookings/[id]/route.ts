import { NextRequest, NextResponse } from "next/server";
import {
  updateBooking,
  deleteBooking,
  getBookings,
} from "@/app/lib/google-calendar";
import {
  createBookingModificationEmail,
  createBookingCancellationEmail,
  sendEmail,
} from "@/app/lib/email-service";

// GET - Obține o programare specifică
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID-ul programării este obligatoriu" },
        { status: 400 }
      );
    }

    // Obține programările pentru a găsi pe cea specifică
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Ultimele 30 de zile

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365); // Următoarele 365 de zile

    const bookings = await getBookings(
      startDate.toISOString(),
      endDate.toISOString()
    );
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error getting booking:", error);
    return NextResponse.json(
      { error: "Eroare la obținerea programării" },
      { status: 500 }
    );
  }
}

// PUT - Modifică o programare
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID-ul programării este obligatoriu" },
        { status: 400 }
      );
    }

    // Validare date
    if (body.date && body.time) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!dateRegex.test(body.date)) {
        return NextResponse.json(
          { error: "Formatul datei trebuie să fie YYYY-MM-DD" },
          { status: 400 }
        );
      }

      if (!timeRegex.test(body.time)) {
        return NextResponse.json(
          { error: "Formatul orei trebuie să fie HH:MM" },
          { status: 400 }
        );
      }

      // Verifică dacă data nu este în trecut
      const bookingDate = new Date(`${body.date}T${body.time}:00+03:00`);
      const now = new Date();
      if (bookingDate <= now) {
        return NextResponse.json(
          { error: "Nu poți modifica o programare în trecut" },
          { status: 400 }
        );
      }
    }

    // Obține programarea originală pentru a compara datele
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    const bookings = await getBookings(
      startDate.toISOString(),
      endDate.toISOString()
    );
    const originalBooking = bookings.find((b) => b.id === bookingId);

    if (!originalBooking) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Actualizează programarea
    const updateResult = await updateBooking(bookingId, body);

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.message },
        { status: 500 }
      );
    }

    // Trimite email de notificare pentru modificare
    if (body.email) {
      try {
        const originalDate = originalBooking.start?.dateTime
          ? new Date(originalBooking.start.dateTime).toISOString().split("T")[0]
          : "";

        const originalTime = originalBooking.start?.dateTime
          ? new Date(originalBooking.start.dateTime).toLocaleTimeString(
              "ro-RO",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            )
          : "";

        const modificationEmail = createBookingModificationEmail(
          {
            name: body.name || "Client",
            phone: body.phone || "N/A",
            email: body.email,
            service: body.service || "N/A",
            date: body.date,
            time: body.time,
            notes: body.notes,
          },
          bookingId,
          originalDate,
          originalTime,
          body.date || originalDate || "",
          body.time || originalTime || ""
        );

        await sendEmail(modificationEmail);
      } catch (emailError) {
        console.error("Error sending modification email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Programarea a fost modificată cu succes!",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Eroare la modificarea programării" },
      { status: 500 }
    );
  }
}

// DELETE - Anulează o programare
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID-ul programării este obligatoriu" },
        { status: 400 }
      );
    }

    // Obține programarea pentru a avea detaliile pentru email
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    const bookings = await getBookings(
      startDate.toISOString(),
      endDate.toISOString()
    );
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Șterge programarea
    const deleteResult = await deleteBooking(bookingId);

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.message },
        { status: 500 }
      );
    }

    // Trimite email de notificare pentru anulare
    try {
      const bookingDate = booking.start?.dateTime
        ? new Date(booking.start.dateTime).toISOString().split("T")[0]
        : "";

      const bookingTime = booking.start?.dateTime
        ? new Date(booking.start.dateTime).toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "";

      // Extrage email-ul din descrierea evenimentului
      const description = booking.description || "";
      const emailMatch = description.match(/Email: ([^\n]+)/);
      const email = emailMatch ? emailMatch[1].trim() : "";

      if (email && email !== "N/A") {
        const cancellationEmail = createBookingCancellationEmail(
          {
            name: booking.summary?.replace("Programare - ", "") || "Client",
            phone: "N/A",
            email,
            service: "N/A",
            date: bookingDate,
            time: bookingTime,
          },
          bookingId
        );

        await sendEmail(cancellationEmail);
      }
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Programarea a fost anulată cu succes!",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Eroare la anularea programării" },
      { status: 500 }
    );
  }
}
