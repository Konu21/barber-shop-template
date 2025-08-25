import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // console.log("🔄 Attempting to add RESCHEDULE_PROPOSED enum to database...");

    // Try to add the enum value
    try {
      await prisma.$executeRaw`ALTER TYPE "public"."BookingStatus" ADD VALUE 'RESCHEDULE_PROPOSED'`;
      // console.log("✅ RESCHEDULE_PROPOSED enum added successfully!");
    } catch (sqlError) {
      // console.log("❌ Direct SQL failed, trying alternative syntax...");

      try {
        await prisma.$executeRaw`ALTER TYPE "BookingStatus" ADD VALUE 'RESCHEDULE_PROPOSED'`;
        // console.log("✅ RESCHEDULE_PROPOSED enum added with alternative syntax!");
      } catch (altError) {
        // console.log("❌ Alternative syntax failed, trying without schema...");

        try {
          await prisma.$executeRaw`ALTER TYPE BookingStatus ADD VALUE 'RESCHEDULE_PROPOSED'`;
          // console.log("✅ RESCHEDULE_PROPOSED enum added without schema!");
        } catch (finalError) {
          // console.log("❌ All SQL attempts failed, trying lowercase...");

          try {
            await prisma.$executeRaw`ALTER TYPE "public"."bookingstatus" ADD VALUE 'RESCHEDULE_PROPOSED'`;
            // console.log("✅ RESCHEDULE_PROPOSED enum added with lowercase!");
          } catch (lowercaseError) {
            throw finalError; // Re-throw the final error
          }
        }
      }
    }

    // Test the enum
    // console.log("🧪 Testing the new enum...");

    const client = await prisma.client.findFirst();
    const service = await prisma.service.findFirst();

    if (!client || !service) {
      return NextResponse.json({
        success: true,
        message: "Enum-ul RESCHEDULE_PROPOSED a fost adăugat cu succes!",
        details:
          "Nu există clienți sau servicii pentru testare, dar enum-ul a fost adăugat.",
        testResults: {
          enumAdded: true,
          enumTested: false,
          reason: "No clients or services available for testing",
        },
      });
    }

    const testBooking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: new Date("2025-01-01T10:00:00+03:00"),
        time: "10:00",
        status: "RESCHEDULE_PROPOSED" as any,
        notes: "Test booking pentru enum nou",
      },
    });

    // console.log("✅ Test booking created with RESCHEDULE_PROPOSED status:",testBooking.id);

    // Clean up test booking
    await prisma.booking.delete({
      where: { id: testBooking.id },
    });

    // console.log("✅ Test booking cleaned up");

    return NextResponse.json({
      success: true,
      message:
        "Enum-ul RESCHEDULE_PROPOSED a fost adăugat și testat cu succes!",
      testResults: {
        enumAdded: true,
        enumTested: true,
        testBookingCreated: true,
        testBookingCleanedUp: true,
      },
    });
  } catch (error) {
    // console.error("❌ Error adding enum:", error);

    // Check if enum already exists
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({
        success: true,
        message: "Enum-ul RESCHEDULE_PROPOSED există deja în baza de date.",
        details: "Enum-ul a fost deja adăugat anterior.",
        testResults: {
          enumAdded: false,
          enumExists: true,
          reason: "Enum already exists",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Nu s-a putut adăuga enum-ul RESCHEDULE_PROPOSED",
        details: error instanceof Error ? error.message : "Unknown error",
        recommendation:
          "Verifică permisiunile bazei de date sau contactează administratorul.",
        testResults: {
          enumAdded: false,
          enumTested: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
