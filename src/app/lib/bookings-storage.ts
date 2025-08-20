import fs from "fs";
import path from "path";
import os from "os";

interface BookingData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled";
  createdAt: string;
  updatedAt: string;
  googleCalendarId?: string; // ID-ul din Google Calendar când programarea este aprobată
}

// In-memory storage for Vercel serverless environment
let inMemoryBookings: BookingData[] = [];

// Check if we're in a serverless environment (Vercel)
const isServerless =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Generează un ID unic pentru programare
function generateBookingId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Citește toate programările
export function readBookings(): BookingData[] {
  try {
    // In serverless environment, always use in-memory storage
    if (isServerless) {
      return inMemoryBookings;
    }

    // For local development, try file system first
    const BOOKINGS_FILE = path.join(os.tmpdir(), "bookings.json");

    if (!fs.existsSync(BOOKINGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading bookings, using in-memory storage:", error);
    return inMemoryBookings;
  }
}

// Scrie programările
function writeBookings(bookings: BookingData[]): void {
  try {
    // In serverless environment, always use in-memory storage
    if (isServerless) {
      inMemoryBookings = bookings;
      return;
    }

    // For local development, try file system first
    const BOOKINGS_FILE = path.join(os.tmpdir(), "bookings.json");
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error writing bookings, using in-memory storage:", error);
    inMemoryBookings = bookings;
  }
}

// Creează o nouă programare
export function createBooking(
  bookingData: Omit<
    BookingData,
    "id" | "status" | "createdAt" | "updatedAt" | "googleCalendarId"
  >
): BookingData {
  const bookings = readBookings();

  const newBooking: BookingData = {
    ...bookingData,
    id: generateBookingId(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  writeBookings(bookings);

  return newBooking;
}

// Actualizează o programare
export function updateBooking(
  id: string,
  updates: Partial<BookingData>
): BookingData | null {
  const bookings = readBookings();
  const index = bookings.findIndex((booking) => booking.id === id);

  if (index === -1) {
    return null;
  }

  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeBookings(bookings);
  return bookings[index];
}

// Șterge o programare
export function deleteBooking(id: string): boolean {
  const bookings = readBookings();
  const filteredBookings = bookings.filter((booking) => booking.id !== id);

  if (filteredBookings.length === bookings.length) {
    return false; // Nu s-a găsit programarea
  }

  writeBookings(filteredBookings);
  return true;
}

// Obține o programare după ID
export function getBookingById(id: string): BookingData | null {
  const bookings = readBookings();
  return bookings.find((booking) => booking.id === id) || null;
}

// Obține toate programările cu filtrare opțională
export function getAllBookings(status?: string): BookingData[] {
  const bookings = readBookings();

  if (status) {
    return bookings.filter((booking) => booking.status === status);
  }

  return bookings;
}
