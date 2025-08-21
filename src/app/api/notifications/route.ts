import { NextRequest, NextResponse } from "next/server";
import { addConnection, removeConnection } from "@/app/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    console.log("🔌 New notification connection request");

    const stream = new ReadableStream({
      start(controller) {
        // Add this connection to the set
        addConnection(controller);
        console.log("✅ Client connected to notifications");

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connected",
          message: "Connected to notifications",
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Send keep-alive every 15 seconds (more frequent for Vercel)
        const keepAliveInterval = setInterval(() => {
          try {
            const keepAliveMessage = `data: ${JSON.stringify({
              type: "keepalive",
              timestamp: Date.now(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(keepAliveMessage));
            console.log("💓 Keep-alive sent");
          } catch (error) {
            console.error("❌ Error sending keep-alive:", error);
            clearInterval(keepAliveInterval);
            removeConnection(controller);
          }
        }, 15000);

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          console.log("🔌 Client disconnected");
          clearInterval(keepAliveInterval);
          removeConnection(controller);
          controller.close();
        });

        // Handle Vercel timeout (10 minutes)
        const timeoutId = setTimeout(() => {
          console.log("⏰ Connection timeout, closing stream");
          clearInterval(keepAliveInterval);
          removeConnection(controller);
          controller.close();
        }, 9 * 60 * 1000); // 9 minutes

        // Clean up timeout on abort
        request.signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
        });
      },

      cancel() {
        console.log("🔌 Stream cancelled");
        // Controller is not available in cancel scope, so we can't remove it here
        // It will be removed in the abort event listener or when the stream ends
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("❌ Error in notifications stream:", error);
    return NextResponse.json(
      { error: "Failed to establish connection" },
      { status: 500 }
    );
  }
}
