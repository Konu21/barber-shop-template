import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing RESCHEDULE_PROPOSED status...");

    // Test 1: Verifică dacă enum-ul este recunoscut
    console.log("📋 Testing enum recognition...");

    // Test 2: Încearcă să creezi o programare cu statusul nou
    console.log("📝 Creating test booking with RESCHEDULE_PROPOSED status...");

    // Găsește primul client și serviciu disponibile
    const client = await prisma.client.findFirst();
    const service = await prisma.service.findFirst();

    if (!client || !service) {
      return NextResponse.json({
        success: false,
        error: "Nu există clienți sau servicii în baza de date",
      });
    }

    // Creează o programare de test cu statusul nou
    const testBooking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: new Date("2025-01-01T10:00:00+03:00"),
        time: "10:00",
        status: "RESCHEDULE_PROPOSED", // Testează noul enum
        notes: "Test booking pentru RESCHEDULE_PROPOSED status",
      },
      include: {
        client: true,
        service: true,
      },
    });

    console.log("✅ Test booking created:", {
      id: testBooking.id,
      status: testBooking.status,
      clientName: testBooking.client.name,
      serviceName: testBooking.service.name,
    });

    // Test 3: Actualizează statusul
    console.log("🔄 Testing status update...");
    const updatedBooking = await prisma.booking.update({
      where: { id: testBooking.id },
      data: { status: "CONFIRMED" },
      include: {
        client: true,
        service: true,
      },
    });

    console.log("✅ Status updated:", updatedBooking.status);

    // Test 4: Șterge programarea de test
    console.log("🗑️ Cleaning up test booking...");
    await prisma.booking.delete({
      where: { id: testBooking.id },
    });

    console.log("✅ Test booking deleted");

    return NextResponse.json({
      success: true,
      message: "Test RESCHEDULE_PROPOSED status successful",
      testResults: {
        enumRecognized: true,
        bookingCreated: true,
        statusUpdated: true,
        bookingDeleted: true,
        finalStatus: updatedBooking.status,
      },
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
