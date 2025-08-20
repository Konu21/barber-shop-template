import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logApiAccess } from "@/app/lib/security-logger";

// Funcție pentru validarea datelor de intrare
function validateBookingInput(data: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Numele trebuie să aibă cel puțin 2 caractere");
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push("Numărul de telefon trebuie să aibă cel puțin 10 caractere");
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Adresa de email nu este validă");
  }

  if (!data.service || data.service.trim().length === 0) {
    errors.push("Serviciul este obligatoriu");
  }

  if (!data.date || !data.time) {
    errors.push("Data și ora sunt obligatorii");
  }

  // Validare dată
  const selectedDate = new Date(`${data.date}T${data.time}:00`);
  const now = new Date();
  if (selectedDate <= now) {
    errors.push("Data și ora trebuie să fie în viitor");
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    await logApiAccess("/api/bookings", "POST", clientIp, userAgent);

    const body = await request.json();
    const validationErrors = validateBookingInput(body);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    // Verifică dacă data nu este în trecut
    const bookingDate = new Date(`${body.date}T${body.time}:00`);
    const now = new Date();
    if (bookingDate <= now) {
      return NextResponse.json(
        { success: false, error: "Nu poți face o programare în trecut" },
        { status: 400 }
      );
    }

    // Creează sau găsește clientul
    let client = await prisma.client.findFirst({
      where: {
        OR: [{ phone: body.phone }, { email: body.email }],
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email,
        },
      });
    }

    // Creează sau găsește serviciul
    let service = await prisma.service.findFirst({
      where: { name: body.service },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: body.service,
          duration: 60, // durată implicită 60 minute
          price: 0, // preț implicit 0
        },
      });
    }

    // Creează programarea
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: new Date(`${body.date}T${body.time}:00`),
        time: body.time,
        notes: body.notes,
        status: "PENDING",
      },
      include: {
        client: true,
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message:
        "Programarea a fost trimisă cu succes! Vei primi un email de confirmare după aprobarea frizerului.",
    });
  } catch (error) {
    console.error("Eroare la crearea programării:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedBookings = bookings.map(
      (booking: {
        id: string;
        client: { name: string; phone: string; email: string | null };
        service: { name: string };
        date: Date;
        time: string;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        googleCalendarId: string | null;
      }) => {
        console.log(
          `📋 Booking ${booking.id} - Original status: ${
            booking.status
          }, Lowercase: ${booking.status.toLowerCase()}`
        );
        return {
          id: booking.id,
          clientName: booking.client.name,
          clientPhone: booking.client.phone,
          clientEmail: booking.client.email || "",
          service: booking.service.name,
          date: booking.date.toISOString().split("T")[0],
          time: booking.time,
          notes: booking.notes,
          status: booking.status.toLowerCase(),
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          googleCalendarId: booking.googleCalendarId,
        };
      }
    );

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
    });
  } catch (error) {
    console.error("Eroare la obținerea programărilor:", error);
    return NextResponse.json(
      { success: false, error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
