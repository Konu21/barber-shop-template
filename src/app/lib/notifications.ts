import { ReadableStreamDefaultController } from "stream/web";

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// console.log("🔌 Notifications module initialized");

// Add a new connection
export function addConnection(controller: ReadableStreamDefaultController) {
  connections.add(controller);
  // console.log(`🔌 Added connection. Total connections: ${connections.size}`);
}

// Remove a connection
export function removeConnection(controller: ReadableStreamDefaultController) {
  connections.delete(controller);
  // console.log(`🔌 Removed connection. Total connections: ${connections.size}`);
}

// Send notification to all connected clients
export function sendNotification(message: any) {
  const messageStr = JSON.stringify(message);
  const data = `data: ${messageStr}\n\n`;

  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      // Connection is closed, remove it
      connections.delete(controller);
    }
  });
}
