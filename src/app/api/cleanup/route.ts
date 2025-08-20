import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/app/lib/config";
import { logSecurityEvent } from "@/app/lib/security-logger";

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${config.CRON_SECRET}`) {
      await logSecurityEvent("unauthorized_cron_access", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Clean up old cancelled bookings (older than 30 days)
    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        status: "CANCELLED",
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Clean up old security logs (older than 90 days)
    // const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    // Note: You'd need to implement this if you have a security_logs table

    console.log(
      `Cleanup completed: ${deletedBookings.count} old bookings removed`
    );

    return NextResponse.json({
      success: true,
      deletedBookings: deletedBookings.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
