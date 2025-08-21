import { NextRequest, NextResponse } from "next/server";
import { addConnection, removeConnection } from "@/app/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const stream = new ReadableStream({
      start(controller) {
        // Add this connection to the set
        addConnection(controller);

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connected",
          message: "Connected to notifications",
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Send keep-alive every 30 seconds
        const keepAliveInterval = setInterval(() => {
          try {
            const keepAliveMessage = `data: ${JSON.stringify({
              type: "keepalive",
              timestamp: Date.now(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(keepAliveMessage));
          } catch (error) {
            clearInterval(keepAliveInterval);
            removeConnection(controller);
          }
        }, 30000);

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(keepAliveInterval);
          removeConnection(controller);
          controller.close();
        });
      },

      cancel() {
        // Controller is not available in cancel scope, so we can't remove it here
        // It will be removed in the abort event listener or when the stream ends
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Error in notifications stream:", error);
    return NextResponse.json(
      { error: "Failed to establish connection" },
      { status: 500 }
    );
  }
}
