import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // console.log("🔄 Checking database schema and applying alternative solution...");

    // Check if we can use RESCHEDULE_PROPOSED directly
    try {
      // Find a client and service to use for testing
      const client = await prisma.client.findFirst();
      const service = await prisma.service.findFirst();

      if (!client || !service) {
        return NextResponse.json({
          success: false,
          error: "Nu există clienți sau servicii pentru testare",
        });
      }

      // console.log("🧪 Testing RESCHEDULE_PROPOSED status directly...");

      const testBooking = await prisma.booking.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          date: new Date("2025-01-01T10:00:00+03:00"),
          time: "10:00",
          status: "RESCHEDULE_PROPOSED" as any, // Force the type
          notes: "Test booking pentru migrație",
        },
      });

      // console.log("✅ Test booking created with RESCHEDULE_PROPOSED status:", testBooking.id);

      // Clean up test booking
      await prisma.booking.delete({
        where: { id: testBooking.id },
      });

      // console.log("✅ Test booking cleaned up");

      return NextResponse.json({
        success: true,
        message:
          "Enum-ul RESCHEDULE_PROPOSED funcționează! Nu este nevoie de migrație.",
        testResults: {
          enumWorks: true,
          testBookingCreated: true,
          testBookingCleanedUp: true,
          migrationNotNeeded: true,
        },
      });
    } catch (enumError) {
      // console.log( "❌ RESCHEDULE_PROPOSED not available, trying alternative approach...");

      // Alternative: Use a different status temporarily
      const client = await prisma.client.findFirst();
      const service = await prisma.service.findFirst();

      if (!client || !service) {
        return NextResponse.json({
          success: false,
          error: "Nu există clienți sau servicii pentru testare",
        });
      }

      // Create a test booking with PENDING status
      const testBooking = await prisma.booking.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          date: new Date("2025-01-01T10:00:00+03:00"),
          time: "10:00",
          status: "PENDING",
          notes: "Test booking pentru verificare",
        },
      });

      // console.log("✅ Test booking created with PENDING status:",testBooking.id);

      // Clean up test booking
      await prisma.booking.delete({
        where: { id: testBooking.id },
      });

      // console.log("✅ Test booking cleaned up");

      return NextResponse.json({
        success: false,
        error:
          "Enum-ul RESCHEDULE_PROPOSED nu este disponibil în baza de date.",
        details:
          "Este nevoie să se adauge enum-ul manual în baza de date PostgreSQL.",
        recommendation:
          "Contactează administratorul bazei de date pentru a adăuga 'RESCHEDULE_PROPOSED' la enum-ul BookingStatus.",
        testResults: {
          enumWorks: false,
          testBookingCreated: true,
          testBookingCleanedUp: true,
          needsManualMigration: true,
        },
      });
    }
  } catch (error) {
    // console.error("❌ Migration check failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Eroare la verificarea migrației",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
