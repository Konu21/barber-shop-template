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
    if (!bookingId || !context) return;

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
          const formattedTime = startDate.toLocaleTimeString(
            context.language === "en" ? "en-US" : "ro-RO",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }
          );

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
          setError(data.error || context.t("booking.error.loading"));
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        setError(context.t("booking.error.loading"));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, form, context]);

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
        setSuccessMessage(t("booking.success.update"));
        setShowSuccess(true);
        setIsEditing(false);
      } else {
        setError(result.error || t("booking.error.update"));
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setError(t("booking.error.update"));
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("booking.confirmDelete"))) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(t("booking.success.delete"));
        setShowSuccess(true);
      } else {
        setError(result.error || t("booking.error.delete"));
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError(t("booking.error.delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-4 text-secondary">{t("booking.loading")}</span>
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
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {t("booking.error.title")}
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {t("booking.error.tryAgain")}
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          {t("booking.error.notFound")}
        </h3>
        <p className="text-yellow-600">{t("booking.error.notFoundDesc")}</p>
      </div>
    );
  }

  const startDate = new Date(booking.start.dateTime);
  const formattedDate = startDate.toLocaleDateString(
    context?.language === "en" ? "en-US" : "ro-RO",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const formattedTime = startDate.toLocaleTimeString(
    context?.language === "en" ? "en-US" : "ro-RO",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-primary shadow-lg rounded-xl border-2 border-separator">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-heading">
              {t("booking.management")}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isEditing ? t("booking.cancelEdit") : t("booking.edit")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? t("booking.deleting") : t("booking.delete")}
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
                    {t("booking.name")} *
                  </label>
                  <input
                    {...form.register("name", { required: true })}
                    type="text"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    {t("booking.phone")} *
                  </label>
                  <input
                    {...form.register("phone", { required: true })}
                    type="tel"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    {t("booking.email")}
                  </label>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    {t("booking.service")} *
                  </label>
                  <select
                    {...form.register("service", { required: true })}
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  >
                    <option value="">{t("booking.selectService")}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {t(`services.${service.id}.name`)} - {service.price} LEI
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    {t("booking.date")} *
                  </label>
                  <input
                    {...form.register("date", { required: true })}
                    type="date"
                    className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-2">
                    {t("booking.time")} *
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
                  {t("booking.notes")}
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
                  {isEditing ? t("booking.saving") : t("booking.saveChanges")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t("booking.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    📅 {t("booking.dateAndTime")}
                  </h3>
                  <p className="text-secondary">{formattedDate}</p>
                  <p className="text-secondary">{formattedTime}</p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    👤 {t("booking.client")}
                  </h3>
                  <p className="text-secondary">
                    {booking.summary?.replace("Programare - ", "")}
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    📞 {t("contact.title")}
                  </h3>
                  <p className="text-secondary">
                    {booking.description?.match(/Telefon: ([^\n]+)/)?.[1] ||
                      t("booking.notAvailable")}
                  </p>
                  <p className="text-secondary">
                    {booking.description?.match(/Email: ([^\n]+)/)?.[1] ||
                      t("booking.notAvailable")}
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    ✂️ {t("booking.service")}
                  </h3>
                  <p className="text-secondary">
                    {booking.description?.match(/Serviciu: ([^\n]+)/)?.[1] ||
                      t("booking.notAvailable")}
                  </p>
                </div>
              </div>

              {booking.description?.match(/Note: ([^\n]+)/)?.[1] && (
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold text-heading mb-2">
                    📝 {t("booking.notes")}
                  </h3>
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
              <h3 className="text-2xl font-bold text-heading mb-2">
                {t("booking.success.title")}
              </h3>
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
                {t("booking.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
