import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking } from "@/app/lib/bookings-storage";
import {
  createBooking as createGoogleCalendarBooking,
  updateBooking as updateGoogleCalendarBooking,
} from "@/app/lib/google-calendar";
import { sendBookingApprovalEmail } from "@/app/lib/email-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const { searchParams } = new URL(request.url);
    const newDate = searchParams.get("date");
    const newTime = searchParams.get("time");

    console.log(
      "✅ Confirm Modification API - Request received for booking:",
      bookingId
    );
    console.log("📝 Confirm Modification API - New date/time:", {
      newDate,
      newTime,
    });

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: "Data și ora sunt obligatorii" },
        { status: 400 }
      );
    }

    // Obține programarea din stocarea locală
    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Actualizează programarea cu noua dată și oră
    const updatedBooking = updateBooking(bookingId, {
      date: newDate,
      time: newTime,
      status: "confirmed",
    });

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Eroare la actualizarea programării" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Confirm Modification API - Local booking updated:",
      updatedBooking
    );

    // Adaugă programarea în Google Calendar
    try {
      console.log(
        "📅 Creating Google Calendar event for confirmed modification..."
      );
      const googleCalendarResult = await createGoogleCalendarBooking({
        name: updatedBooking.name,
        phone: updatedBooking.phone,
        email: updatedBooking.email,
        service: updatedBooking.service,
        date: updatedBooking.date,
        time: updatedBooking.time,
        notes: updatedBooking.notes,
      });

      if (googleCalendarResult.success) {
        // Actualizează programarea cu ID-ul din Google Calendar
        updateBooking(bookingId, {
          googleCalendarId: googleCalendarResult.bookingId,
        });
        console.log("✅ Successfully created Google Calendar event");
      } else {
        console.warn(
          "⚠️ Could not create Google Calendar event:",
          googleCalendarResult.message
        );
      }
    } catch (error) {
      console.error("❌ Error creating Google Calendar event:", error);
    }

    // Trimite email de confirmare către client
    if (updatedBooking.email) {
      try {
        await sendBookingApprovalEmail(
          {
            name: updatedBooking.name,
            phone: updatedBooking.phone,
            email: updatedBooking.email,
            service: updatedBooking.service,
            date: updatedBooking.date,
            time: updatedBooking.time,
            notes: updatedBooking.notes,
          },
          bookingId
        );
        console.log("✅ Confirmation email sent to client");
      } catch (error) {
        console.error("❌ Error sending confirmation email:", error);
      }
    }

    // Returnează o pagină HTML de confirmare
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Modificare Confirmată - Barber Shop</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            text-align: center;
          }
          .success { 
            background: #d4edda; 
            border: 1px solid #c3e6cb; 
            color: #155724; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .details { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            text-align: left;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 5px;
          }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Modificare Confirmată!</h1>
          <p>Programarea ta a fost modificată și confirmată cu succes.</p>
        </div>
        
        <div class="details">
          <h3>📅 Detalii Programare</h3>
          <p><strong>Data și ora:</strong> ${new Date(
            `${newDate}T${newTime}:00`
          ).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
          <p><strong>Serviciu:</strong> ${updatedBooking.service}</p>
          <p><strong>Nume:</strong> ${updatedBooking.name}</p>
          <p><strong>Telefon:</strong> ${updatedBooking.phone}</p>
          ${
            updatedBooking.notes
              ? `<p><strong>Note:</strong> ${updatedBooking.notes}</p>`
              : ""
          }
          <p><strong>ID Programare:</strong> ${bookingId}</p>
        </div>
        
        <p>Vei primi un email de confirmare în câteva minute.</p>
        
        <a href="${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }" class="button">
          ← Înapoi la Site
        </a>
      </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("❌ Error in confirm modification API:", error);
    return NextResponse.json(
      { error: "Eroare la confirmarea modificării" },
      { status: 500 }
    );
  }
}
