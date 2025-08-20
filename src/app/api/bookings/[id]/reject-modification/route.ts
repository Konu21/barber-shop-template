import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking } from "@/app/lib/bookings-storage";
import { sendBookingRejectionEmail } from "@/app/lib/email-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    console.log(
      "❌ Reject Modification API - Request received for booking:",
      bookingId
    );

    // Obține programarea din stocarea locală
    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Resetează programarea la statusul original (pending) și nu schimba data/ora
    const updatedBooking = updateBooking(bookingId, {
      status: "pending",
    });

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Eroare la actualizarea programării" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Reject Modification API - Local booking reset to pending:",
      updatedBooking
    );

    // Trimite email de respingere către client
    if (updatedBooking.email) {
      try {
        await sendBookingRejectionEmail(
          {
            name: updatedBooking.name,
            phone: updatedBooking.phone,
            email: updatedBooking.email,
            service: updatedBooking.service,
            date: updatedBooking.date,
            time: updatedBooking.time,
            notes: updatedBooking.notes,
          },
          bookingId,
          "Ai respins modificarea propusă de frizer. Programarea rămâne la data și ora originală."
        );
        console.log("✅ Rejection email sent to client");
      } catch (error) {
        console.error("❌ Error sending rejection email:", error);
      }
    }

    // Returnează o pagină HTML de respingere
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Modificare Respinsă - Barber Shop</title>
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
          .rejection { 
            background: #f8d7da; 
            border: 1px solid #f5c6cb; 
            color: #721c24; 
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
        <div class="rejection">
          <h1>❌ Modificare Respinsă</h1>
          <p>Ai respins modificarea propusă de frizer. Programarea rămâne la data și ora originală.</p>
        </div>
        
        <div class="details">
          <h3>📅 Detalii Programare Originală</h3>
          <p><strong>Data și ora:</strong> ${new Date(
            `${updatedBooking.date}T${updatedBooking.time}:00`
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
          <p><strong>Status:</strong> În așteptare</p>
        </div>
        
        <p>Frizerul va fi notificat despre respingerea modificării.</p>
        
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
    console.error("❌ Error in reject modification API:", error);
    return NextResponse.json(
      { error: "Eroare la respingerea modificării" },
      { status: 500 }
    );
  }
}
