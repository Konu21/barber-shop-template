// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Function to send notifications to all connected clients
export function sendNotification(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  console.log(
    `📨 Sending notification to ${connections.size} clients:`,
    data.type
  );

  // Create a copy of the set to avoid modification during iteration
  const activeConnections = Array.from(connections);

  activeConnections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      // Remove the problematic connection
      connections.delete(controller);
    }
  });
}

// Function to add a connection to the set
export function addConnection(controller: ReadableStreamDefaultController) {
  connections.add(controller);
  console.log(`🔌 Added connection. Total connections: ${connections.size}`);
}

// Function to remove a connection from the set
export function removeConnection(controller: ReadableStreamDefaultController) {
  connections.delete(controller);
  console.log(`🔌 Removed connection. Total connections: ${connections.size}`);
}
