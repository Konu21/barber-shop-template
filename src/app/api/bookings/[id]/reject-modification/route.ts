import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

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

    // Pentru respingerea modificării, nu facem nimic în baza de date
    // Programarea rămâne la data și ora originală
    console.log("✅ Modificarea a fost respinsă de client");

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
