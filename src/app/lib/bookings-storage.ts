import fs from "fs";
import path from "path";

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

const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");

// Asigură-te că directorul există
function ensureDataDirectory() {
  const dataDir = path.dirname(BOOKINGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Generează un ID unic pentru programare
function generateBookingId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Citește toate programările din fișier
export function readBookings(): BookingData[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(BOOKINGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading bookings:", error);
    return [];
  }
}

// Scrie programările în fișier
function writeBookings(bookings: BookingData[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error writing bookings:", error);
    throw new Error("Failed to save booking");
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
