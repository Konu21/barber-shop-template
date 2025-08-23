import { NextRequest, NextResponse } from "next/server";

// In-memory storage for notifications (in production, use Redis or database)
const notifications = new Map();
let notificationId = 0;

// Function to add a notification
function addNotification(data: any) {
  const id = ++notificationId;
  const notification = {
    id,
    ...data,
    timestamp: Date.now(),
  };
  notifications.set(id, notification);

  // Keep only last 100 notifications to prevent memory leaks
  if (notifications.size > 100) {
    const firstKey = notifications.keys().next().value;
    notifications.delete(firstKey);
  }

  console.log(`📨 Added notification ${id}:`, data.type);
  return id;
}

// Function to get notifications since a specific timestamp
function getNotificationsSince(timestamp: number) {
  const recentNotifications = [];
  for (const [id, notification] of notifications) {
    if (notification.timestamp > timestamp) {
      recentNotifications.push(notification);
    }
  }
  return recentNotifications.sort((a, b) => a.timestamp - b.timestamp);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get("since") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log(
      `📨 Polling notifications since ${new Date(since).toISOString()}`
    );

    const recentNotifications = getNotificationsSince(since).slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications: recentNotifications,
      timestamp: Date.now(),
      count: recentNotifications.length,
    });
  } catch (error) {
    console.error("❌ Error in notifications poll:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Endpoint to manually add a notification (for testing)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const id = addNotification(data);

    return NextResponse.json({
      success: true,
      id,
      message: "Notification added successfully",
    });
  } catch (error) {
    console.error("❌ Error adding notification:", error);
    return NextResponse.json(
      { error: "Failed to add notification" },
      { status: 500 }
    );
  }
}
