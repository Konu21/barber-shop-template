"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { LanguageContext } from "@/app/components/LanguageProvider";
import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageToggle from "@/app/components/LanguageToggle";

interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled";
  createdAt: string;
  updatedAt: string;
}

interface BookingWithClient extends Booking {
  serviceName: string;
  servicePrice: number;
  serviceDuration: string;
}

export default function Dashboard() {
  const router = useRouter();
  const languageContext = useContext(LanguageContext);
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] =
    useState<BookingWithClient | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fallback pentru cazul când contextul nu este disponibil
  const t = languageContext?.t || ((key: string) => key);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("dashboardToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboardToken");
    document.cookie =
      "dashboardToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/dashboard/login");
  };

  const handleStatusChange = async (
    booking: BookingWithClient,
    status: string
  ) => {
    try {
      let endpoint = `/api/bookings/${booking.id}`;

      // Map status to correct API endpoint
      switch (status) {
        case "confirmed":
          endpoint += "/approve";
          break;
        case "cancelled":
          endpoint += "/cancel";
          break;
        case "rejected":
          endpoint += "/reject";
          break;
        default:
          console.error(`Unknown status: ${status}`);
          return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchBookings(); // Refresh bookings
      } else {
        console.error(`Failed to ${status} booking`);
      }
    } catch (error) {
      console.error(`Error ${status} booking:`, error);
    }
  };

  const handleEditBooking = async () => {
    if (!editingBooking) return;

    try {
      const updates: { status: string; date?: string; time?: string } = {
        status: newStatus,
      };
      if (newDate) updates.date = newDate;
      if (newTime) updates.time = newTime;

      const response = await fetch(
        `/api/bookings/${editingBooking.id}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        setEditingBooking(null);
        fetchBookings(); // Refresh bookings
      } else {
        console.error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const openEditDialog = (booking: BookingWithClient) => {
    setEditingBooking(booking);
    setNewStatus(booking.status);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  // const _getStatusBadge = (status: string) => {
  //   const styles = {
  //     pending: "bg-accent/20 text-accent border-accent/30",
  //     confirmed: "bg-accent/20 text-accent border-accent/30",
  //     cancelled: "bg-secondary text-primary border-separator",
  //     rescheduled: "bg-accent/20 text-accent border-accent/30",
  //   };

  //   const labels = {
  //     pending: t("status.pending"),
  //     confirmed: t("status.confirmed"),
  //     cancelled: t("status.cancelled"),
  //     rescheduled: t("status.rescheduled"),
  //   };

  //   return (
  //     <span
  //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
  //         styles[status as keyof typeof styles] ||
  //         "bg-secondary text-primary border-separator"
  //       }`}
  //     >
  //       {labels[status as keyof typeof labels] || status}
  //     </span>
  //   );
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const language = languageContext?.language || "ro";
    return date.toLocaleDateString(language === "ro" ? "ro-RO" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filterBookings = (status?: string): BookingWithClient[] => {
    if (!status) return bookings;
    return bookings.filter((booking) => booking.status === status);
  };

  // Group bookings by date periods
  const getBookingsByPeriod = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      today: bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        return (
          bookingDate.getTime() === today.getTime() &&
          booking.status === "confirmed"
        );
      }),
      tomorrow: bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        return (
          bookingDate.getTime() === tomorrow.getTime() &&
          booking.status === "confirmed"
        );
      }),
      thisWeek: bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate >= today &&
          bookingDate < nextWeek &&
          booking.status === "confirmed"
        );
      }),
      thisMonth: bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate >= today &&
          bookingDate < nextMonth &&
          booking.status === "confirmed"
        );
      }),
      past: bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate < today;
      }),
    };
  };

  const bookingsByPeriod = getBookingsByPeriod();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: bookings.filter(
      (b) =>
        new Date(b.date) >= today &&
        (b.status === "confirmed" || b.status === "pending")
    ).length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeTab) {
      case "today":
        return bookingsByPeriod.today;
      case "tomorrow":
        return bookingsByPeriod.tomorrow;
      case "week":
        return bookingsByPeriod.thisWeek;
      case "pending":
        return filterBookings("pending");
      case "past":
        return bookingsByPeriod.past;
      default:
        // "all" - toate programările (confirmate + în așteptare) din prezent în viitor
        return bookings.filter(
          (booking) =>
            (booking.status === "confirmed" || booking.status === "pending") &&
            new Date(booking.date) >= today
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-primary shadow-lg border-b border-separator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-heading">
                {t("dashboard.title")}
              </h1>
              <p className="text-secondary">{t("dashboard.welcome")}, admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-separator rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {t("dashboard.logout")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">{stats.total}</div>
            <div className="text-sm text-secondary">{t("stats.total")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.pending}
            </div>
            <div className="text-sm text-secondary">{t("stats.pending")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.confirmed}
            </div>
            <div className="text-sm text-secondary">{t("stats.confirmed")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.cancelled}
            </div>
            <div className="text-sm text-secondary">{t("stats.cancelled")}</div>
          </div>
        </div>

        {/* Date Period Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {bookingsByPeriod.today.length}
            </div>
            <div className="text-sm text-secondary">{t("period.today")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {bookingsByPeriod.tomorrow.length}
            </div>
            <div className="text-sm text-secondary">{t("period.tomorrow")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {bookingsByPeriod.thisWeek.length}
            </div>
            <div className="text-sm text-secondary">{t("period.week")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {bookingsByPeriod.thisMonth.length}
            </div>
            <div className="text-sm text-secondary">{t("period.month")}</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-accent">
              {bookingsByPeriod.past.length}
            </div>
            <div className="text-sm text-secondary">{t("period.past")}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-primary rounded-lg shadow">
          <div className="border-b border-separator">
            <nav className="-mb-px flex space-x-6 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
              {[
                { key: "all", label: t("tabs.all"), count: stats.total },
                {
                  key: "today",
                  label: t("period.today"),
                  count: bookingsByPeriod.today.length,
                },
                {
                  key: "tomorrow",
                  label: t("period.tomorrow"),
                  count: bookingsByPeriod.tomorrow.length,
                },
                {
                  key: "week",
                  label: t("period.week"),
                  count: bookingsByPeriod.thisWeek.length,
                },
                {
                  key: "pending",
                  label: t("tabs.pending"),
                  count: stats.pending,
                },
                {
                  key: "past",
                  label: t("tabs.past"),
                  count: bookingsByPeriod.past.length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary hover:text-primary hover:border-separator"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <BookingsList
              bookings={getFilteredBookings()}
              onEdit={openEditDialog}
              onStatusChange={handleStatusChange}
              t={t}
              formatDate={formatDate}
            />
          </div>
        </div>
      </main>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-primary">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-heading mb-4">
                {t("edit.title")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    {t("edit.status")}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-separator rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary text-primary"
                  >
                    <option value="pending">{t("status.pending")}</option>
                    <option value="confirmed">{t("status.confirmed")}</option>
                    <option value="cancelled">{t("status.cancelled")}</option>
                    <option value="rescheduled">
                      {t("status.rescheduled")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    {t("edit.date")}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-separator rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    {t("edit.time")}
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-separator rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary text-primary"
                  >
                    {[
                      "09:00",
                      "10:00",
                      "11:00",
                      "12:00",
                      "14:00",
                      "15:00",
                      "16:00",
                      "17:00",
                      "18:00",
                    ].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditBooking}
                    className="flex-1 bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  >
                    {t("edit.update")}
                  </button>
                  <button
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 bg-secondary hover:bg-card text-primary font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-separator focus:ring-offset-2"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bookings List Component
function BookingsList({
  bookings,
  onEdit,
  onStatusChange,
  t,
  formatDate,
}: {
  bookings: BookingWithClient[];
  onEdit: (booking: BookingWithClient) => void;
  onStatusChange: (booking: BookingWithClient, status: string) => void;
  t: (key: string) => string;
  formatDate: (dateString: string) => string;
}) {
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      rescheduled: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const labels = {
      pending: "În așteptare",
      confirmed: "Confirmat",
      cancelled: "Anulat",
      rescheduled: "Reprogramat",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-secondary">{t("no.bookings")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-primary border border-separator rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h3 className="font-semibold text-lg text-heading">
                  {booking.service}
                </h3>
                {getStatusBadge(booking.status)}
              </div>

              {/* Client Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm text-secondary break-all">
                    {booking.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href={`tel:${booking.clientPhone}`}
                    className="text-accent hover:text-accent-hover underline text-sm break-all"
                    title="Apelază numărul"
                  >
                    {booking.clientPhone}
                  </a>
                </div>
                {booking.clientEmail && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${booking.clientEmail}`}
                      className="text-accent hover:text-accent-hover underline text-sm break-all"
                      title="Trimite email"
                    >
                      {booking.clientEmail}
                    </a>
                  </div>
                )}
              </div>

              {/* Date and Time Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-secondary">
                    {formatDate(booking.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-secondary">{booking.time}</span>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-3 p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-primary">
                    <strong>Observații:</strong> {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-separator">
            {booking.status === "pending" && (
              <>
                <button
                  onClick={() => onStatusChange(booking, "confirmed")}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  aria-label={`Confirm booking for ${booking.clientName}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Confirmă</span>
                  <span className="sm:hidden">✓</span>
                </button>
                <button
                  onClick={() => onStatusChange(booking, "cancelled")}
                  className="inline-flex items-center px-3 py-1.5 border border-separator text-xs font-medium rounded-md text-primary bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-separator"
                  aria-label={`Cancel booking for ${booking.clientName}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="hidden sm:inline">Anulează</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </>
            )}

            {booking.status === "confirmed" && (
              <button
                onClick={() => onStatusChange(booking, "cancelled")}
                className="inline-flex items-center px-3 py-1.5 border border-separator text-xs font-medium rounded-md text-primary bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-separator"
                aria-label={`Cancel booking for ${booking.clientName}`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="hidden sm:inline">Anulează</span>
                <span className="sm:hidden">✕</span>
              </button>
            )}

            <button
              onClick={() => onEdit(booking)}
              className="inline-flex items-center px-3 py-1.5 border border-separator text-xs font-medium rounded-md text-primary bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              aria-label={`Edit booking for ${booking.clientName || "client"}`}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Editează</span>
              <span className="sm:hidden">✏️</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
