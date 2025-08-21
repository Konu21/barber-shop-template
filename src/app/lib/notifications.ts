// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Function to send notifications to all connected clients
export function sendNotification(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });
}

// Function to add a connection to the set
export function addConnection(controller: ReadableStreamDefaultController) {
  connections.add(controller);
}

// Function to remove a connection from the set
export function removeConnection(controller: ReadableStreamDefaultController) {
  connections.delete(controller);
}
