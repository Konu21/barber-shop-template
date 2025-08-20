"use client";

import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { LanguageContext } from "./LanguageProvider";
import { services } from "../data/services";

interface Booking {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

interface BookingManagementProps {
  bookingId: string;
}

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

export default function BookingManagement({
  bookingId,
}: BookingManagementProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<BookingFormData>({
    mode: "onBlur",
  });

  const context = useContext(LanguageContext);

  // Încarcă detaliile programării
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);

          // Parsează detaliile din descriere
          const description = data.booking.description || "";
          const nameMatch = description.match(/Client: ([^\n]+)/);
          const phoneMatch = description.match(/Telefon: ([^\n]+)/);
          const emailMatch = description.match(/Email: ([^\n]+)/);
          const serviceMatch = description.match(/Serviciu: ([^\n]+)/);
          const notesMatch = description.match(/Note: ([^\n]+)/);

          const startDate = new Date(data.booking.start.dateTime);
          const formattedDate = startDate.toISOString().split("T")[0];
          const formattedTime = startDate.toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          form.reset({
            name: nameMatch
              ? nameMatch[1].trim()
              : data.booking.summary?.replace("Programare - ", "") || "",
            phone: phoneMatch ? phoneMatch[1].trim() : "",
            email: emailMatch ? emailMatch[1].trim() : "",
            service: serviceMatch ? serviceMatch[1].trim() : "",
            date: formattedDate,
            time: formattedTime,
            notes: notesMatch ? notesMatch[1].trim() : "",
          });
        } else {
          setError(data.error || "Eroare la încărcarea programării");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        setError("Eroare la încărcarea programării");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, form]);

  if (!context) {
    return null;
  }

  const { t } = context;

  const handleUpdate = async (data: BookingFormData) => {
    try {
      setIsEditing(true);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Programarea a fost modificată cu succes!");
        setShowSuccess(true);
        setIsEditing(false);
      } else {
        setError(result.error || "Eroare la modificarea programării");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("Eroare la modificarea programării");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Ești sigur că vrei să anulezi această programare?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Programarea a fost anulată cu succes!");
        setShowSuccess(true);
      } else {
        setError(result.error || "Eroare la anularea programării");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("Eroare la anularea programării");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-4 text-secondary">Se încarcă programarea...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Eroare</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Programarea nu a fost găsită
        </h3>
        <p className="text-yellow-600">
          Programarea cu ID-ul specificat nu există sau a fost ștearsă.
        </p>
      </div>
    );
  }

  const startDate = new Date(booking.start.dateTime);
  const formattedDate = startDate.toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-primary shadow-lg rounded-xl border-2 border-separator">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-heading">
              Gestionare Programare
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isEditing ? "Anulează Editarea" : "✏️ Modifică"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Se șterge..." : "❌ Anulează"}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Nume *
                  </label>
                  <input
                    {...form.register("name", { required: true })}
                    type="text"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Telefon *
                  </label>
                  <input
                    {...form.register("phone", { required: true })}
                    type="tel"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Email
                  </label>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Serviciu *
                  </label>
                  <select
                    {...form.register("service", { required: true })}
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  >
                    <option value="">Selectează serviciul</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {t(`services.${service.id}.name`)} - {service.price} LEI
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Data *
                  </label>
                  <input
                    {...form.register("date", { required: true })}
                    type="date"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    Ora *
                  </label>
                  <input
                    {...form.register("time", { required: true })}
                    type="time"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-2">
                  Note
                </label>
                <textarea
                  {...form.register("notes")}
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isEditing}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isEditing ? "Se salvează..." : "💾 Salvează Modificările"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Anulează
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    📅 Data și Ora
                  </h3>
                  <p className="text-secondary">{formattedDate}</p>
                  <p className="text-secondary">{formattedTime}</p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">👤 Client</h3>
                  <p className="text-secondary">
                    {booking.summary?.replace("Programare - ", "")}
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    📞 Contact
                  </h3>
                  <p className="text-secondary">
                    {booking.description?.match(/Telefon: ([^\n]+)/)?.[1] ||
                      "N/A"}
                  </p>
                  <p className="text-secondary">
                    {booking.description?.match(/Email: ([^\n]+)/)?.[1] ||
                      "N/A"}
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    ✂️ Serviciu
                  </h3>
                  <p className="text-secondary">
                    {booking.description?.match(/Serviciu: ([^\n]+)/)?.[1] ||
                      "N/A"}
                  </p>
                </div>
              </div>

              {booking.description?.match(/Note: ([^\n]+)/)?.[1] && (
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">📝 Note</h3>
                  <p className="text-secondary">
                    {booking.description?.match(/Note: ([^\n]+)/)?.[1]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary p-8 rounded-xl shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-heading mb-2">Succes!</h3>
              <p className="text-secondary mb-6">{successMessage}</p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  if (successMessage.includes("anulată")) {
                    window.location.href = "/";
                  }
                }}
                className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
