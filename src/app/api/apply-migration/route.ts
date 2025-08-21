import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Applying migration to add RESCHEDULE_PROPOSED enum...");

    // Execute the migration SQL
    await prisma.$executeRaw`ALTER TYPE "public"."BookingStatus" ADD VALUE 'RESCHEDULE_PROPOSED'`;

    console.log("✅ Migration applied successfully!");

    // Test the enum
    console.log("🧪 Testing the new enum...");

    // Find a client and service to use for testing
    const client = await prisma.client.findFirst();
    const service = await prisma.service.findFirst();

    if (!client || !service) {
      return NextResponse.json({
        success: false,
        error: "Nu există clienți sau servicii pentru testare",
      });
    }

    const testBooking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: new Date("2025-01-01T10:00:00+03:00"),
        time: "10:00",
        status: "RESCHEDULE_PROPOSED",
        notes: "Test booking pentru migrație",
      },
    });

    console.log(
      "✅ Test booking created with RESCHEDULE_PROPOSED status:",
      testBooking.id
    );

    // Clean up test booking
    await prisma.booking.delete({
      where: { id: testBooking.id },
    });

    console.log("✅ Test booking cleaned up");

    return NextResponse.json({
      success: true,
      message:
        "Migrația a fost aplicată cu succes! Enum-ul RESCHEDULE_PROPOSED este acum disponibil.",
      testResults: {
        migrationApplied: true,
        enumTested: true,
        testBookingCreated: true,
        testBookingCleanedUp: true,
      },
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);

    // Check if the enum already exists
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({
        success: true,
        message: "Enum-ul RESCHEDULE_PROPOSED există deja în baza de date.",
        details: "Enum-ul a fost deja adăugat anterior.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Eroare la aplicarea migrației",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
