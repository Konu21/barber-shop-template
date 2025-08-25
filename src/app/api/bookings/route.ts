import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logApiAccess } from "@/app/lib/security-logger";

// Import notifications utility
import { sendNotification } from "@/app/lib/notifications";

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

  if (!data.email || data.email.trim().length === 0) {
    errors.push("Adresa de email este obligatorie");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Adresa de email nu este validă");
  }

  if (!data.service || data.service.trim().length === 0) {
    errors.push("Serviciul este obligatoriu");
  }

  // Validate service ID
  const validServiceIds = [
    "tundere-clasica",
    "styling-modern",
    "aranjare-barba",
    "tratament-facial",
    "pachet-complet",
    "tundere-copii",
  ];

  if (!validServiceIds.includes(data.service)) {
    errors.push("Serviciul selectat nu este valid");
  }

  if (!data.date || !data.time) {
    errors.push("Data și ora sunt obligatorii");
  }

  // Validare dată
  const selectedDate = new Date(`${data.date}T${data.time}:00+03:00`);
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
        {
          success: false,
          error:
            "Invalid booking data. Please check your information and try again.",
        },
        { status: 400 }
      );
    }

    // Verifică dacă data nu este în trecut
    const bookingDate = new Date(`${body.date}T${body.time}:00+03:00`);
    const now = new Date();
    if (bookingDate <= now) {
      return NextResponse.json(
        { success: false, error: "Cannot book appointments in the past" },
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
    } else {
      // Actualizează datele clientului dacă sunt diferite
      const needsUpdate =
        client.name !== body.name || client.email !== body.email;

      if (needsUpdate) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: {
            name: body.name,
            email: body.email,
          },
        });
      }
    }

    // Map service ID to service name
    const serviceMap: {
      [key: string]: { name: string; duration: number; price: number };
    } = {
      "tundere-clasica": { name: "Tundere Clasică", duration: 30, price: 25 },
      "styling-modern": { name: "Styling Modern", duration: 45, price: 30 },
      "aranjare-barba": { name: "Aranjare Barbă", duration: 20, price: 15 },
      "tratament-facial": { name: "Tratament Facial", duration: 25, price: 20 },
      "pachet-complet": { name: "Pachet Complet", duration: 90, price: 60 },
      "tundere-copii": { name: "Tundere Copii", duration: 25, price: 18 },
    };

    const serviceInfo = serviceMap[body.service];
    if (!serviceInfo) {
      return NextResponse.json(
        { success: false, error: "Selected service is not valid" },
        { status: 400 }
      );
    }

    // Creează sau găsește serviciul
    let service = await prisma.service.findFirst({
      where: { name: serviceInfo.name },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceInfo.name,
          duration: serviceInfo.duration,
          price: serviceInfo.price,
        },
      });
    }

    // Creează programarea
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: new Date(`${body.date}T${body.time}:00+03:00`),
        time: body.time,
        notes: body.notes,
        status: "PENDING",
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Trimite notificare în timp real către dashboard
    try {
      if (sendNotification) {
        sendNotification({
          type: "new_booking",
          booking: {
            id: booking.id,
            clientName: booking.client.name,
            clientPhone: booking.client.phone,
            clientEmail: booking.client.email || "",
            service: booking.service.name,
            date: booking.date.toISOString().split("T")[0],
            time: booking.time,
            notes: booking.notes,
            status: "pending",
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          },
          message: "Programare nouă primită!",
        });
      }
    } catch (error) {
      console.error("❌ Eroare la trimiterea notificării:", error);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message:
        "Booking submitted successfully! You will receive a confirmation email after approval.",
    });
  } catch (error) {
    console.error("Eroare la crearea programării:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
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

    const response = NextResponse.json({
      success: true,
      bookings: transformedBookings,
    });

    // Add cache control headers
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Eroare la obținerea programărilor:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
