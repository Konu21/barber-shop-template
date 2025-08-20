import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityForDate } from "@/app/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Data este obligatorie" },
        { status: 400 }
      );
    }

    // Validează formatul datei (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Formatul datei trebuie să fie YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const availability = await getAvailabilityForDate(date);

    return NextResponse.json({
      success: true,
      date,
      availability,
    });
  } catch (error) {
    console.error("Error getting availability:", error);
    return NextResponse.json(
      { error: "Eroare la obținerea disponibilității" },
      { status: 500 }
    );
  }
}
