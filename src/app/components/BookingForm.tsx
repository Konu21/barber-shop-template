"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { LanguageContext } from "./LanguageProvider";
import { services } from "../data/services";

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  bookingId?: string;
}

interface BookingFormProps {
  selectedDate: string | null;
  selectedTime: string | null;
}

export default function BookingForm({
  selectedDate,
  selectedTime,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // const [_bookingId, setBookingId] = useState<string | null>(null);

  const form = useForm<BookingFormData>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      date: "",
      time: "",
      notes: "",
    },
    mode: "onBlur", // Validează când input-ul pierde focus
  });

  const context = useContext(LanguageContext);

  if (!context) {
    return null;
  }

  const { t } = context;

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      alert(t("booking.selectDateAndTime"));
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...data,
        date: selectedDate,
        time: selectedTime,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        // console.log("Booking created successfully:", result);
        // setBookingId(result.bookingId);
        setShowSuccess(true);
        form.reset();
      } else {
        alert(result.error || "Eroare la crearea programării");
      }
    } catch (_error) {
      console.error("Error creating booking:", _error);
      alert("Eroare la crearea programării. Te rugăm să încerci din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 ">
      {/* Booking Form */}
      <div className="bg-primary shadow-lg rounded-xl border-2 border-separator">
        <div className="p-8">
          <h4 className="text-2xl font-bold text-heading mb-6">
            {t("booking.formTitle")}
          </h4>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="booking-name"
                className="block text-sm font-semibold text-heading mb-2"
              >
                {t("booking.name")} *
              </label>
              <input
                {...form.register("name", { required: true })}
                id="booking-name"
                type="text"
                className={`w-full px-4 py-3 bg-secondary text-heading border rounded-lg focus:ring-2 focus:ring-accent/20 transition-colors ${
                  form.formState.errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-separator focus:border-accent"
                }`}
                placeholder={t("booking.namePlaceholder")}
                aria-describedby={
                  form.formState.errors.name ? "name-error" : undefined
                }
                aria-invalid={form.formState.errors.name ? "true" : "false"}
                onBlur={() => {
                  form.trigger("name");
                }}
              />
              {form.formState.errors.name && (
                <p
                  id="name-error"
                  className="text-red-500 text-sm mt-1 animate-pulse"
                  role="alert"
                >
                  {t("booking.nameRequired")}
                </p>
              )}
            </div>
            {/* Phone */}
            <div>
              <label
                htmlFor="booking-phone"
                className="block text-sm font-semibold text-heading mb-2"
              >
                {t("booking.phone")} *
              </label>
              <input
                {...form.register("phone", {
                  required: true,
                  pattern: {
                    value: /^[0-9+\s-]+$/,
                    message: t("booking.phoneInvalid"),
                  },
                  validate: {
                    length: (value) => {
                      const digitsOnly = value.replace(/[^0-9]/g, "");
                      return (
                        (digitsOnly.length >= 10 && digitsOnly.length <= 13) ||
                        t("booking.phoneLength")
                      );
                    },
                    romanianFormat: (value) => {
                      const digitsOnly = value.replace(/[^0-9]/g, "");
                      if (
                        digitsOnly.startsWith("40") &&
                        digitsOnly.length === 11
                      )
                        return true;
                      if (
                        digitsOnly.startsWith("07") &&
                        digitsOnly.length === 10
                      )
                        return true;
                      // if (
                      //   (digitsOnly.startsWith("+40") ||
                      //     digitsOnly.startsWith("07")) &&
                      //   digitsOnly.length === 9
                      // )
                      //   return true;
                      return t("booking.phoneFormat");
                    },
                  },
                })}
                id="booking-phone"
                type="tel"
                className={`w-full px-4 py-3 bg-secondary text-heading border rounded-lg focus:ring-2 focus:ring-accent/20 transition-colors ${
                  form.formState.errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : "border-separator focus:border-accent"
                }`}
                placeholder="+40 7XX XXX XXX"
                aria-describedby={
                  form.formState.errors.phone ? "phone-error" : undefined
                }
                aria-invalid={form.formState.errors.phone ? "true" : "false"}
                onBlur={() => {
                  form.trigger("phone");
                }}
              />
              {form.formState.errors.phone && (
                <p
                  id="phone-error"
                  className="text-red-500 text-sm mt-1 animate-pulse"
                  role="alert"
                >
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            {/* Email */}
            <div>
              <label
                htmlFor="booking-email"
                className="block text-sm font-semibold text-heading mb-2"
              >
                {t("booking.email")} *
              </label>
              <input
                {...form.register("email", {
                  required: t("booking.emailRequired"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("booking.emailInvalid"),
                  },
                })}
                id="booking-email"
                type="email"
                className={`w-full px-4 py-3 bg-secondary text-heading border rounded-lg focus:ring-2 focus:ring-accent/20 transition-colors ${
                  form.formState.errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-separator focus:border-accent"
                }`}
                placeholder="email@exemplu.com"
                aria-describedby={
                  form.formState.errors.email ? "email-error" : undefined
                }
                aria-invalid={form.formState.errors.email ? "true" : "false"}
                onBlur={() => {
                  form.trigger("email");
                }}
              />
              {form.formState.errors.email && (
                <p
                  id="email-error"
                  className="text-red-500 text-sm mt-1 animate-pulse"
                  role="alert"
                >
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            {/* Service */}
            <div>
              <label
                htmlFor="booking-service"
                className="block text-sm font-semibold text-heading mb-2"
              >
                {t("booking.service")} *
              </label>
              <select
                {...form.register("service", { required: true })}
                id="booking-service"
                className={`w-full px-4 py-3 bg-secondary text-heading border rounded-lg focus:ring-2 focus:ring-accent/20 transition-colors ${
                  form.formState.errors.service
                    ? "border-red-500 focus:border-red-500"
                    : "border-separator focus:border-accent"
                }`}
                aria-describedby={
                  form.formState.errors.service ? "service-error" : undefined
                }
                aria-invalid={form.formState.errors.service ? "true" : "false"}
                onBlur={() => {
                  form.trigger("service");
                }}
              >
                <option value="">{t("booking.selectService")}</option>
                {services.map((service) => (
                  <option
                    className="text-heading"
                    key={service.id}
                    value={service.name}
                  >
                    {service.name} - {service.price} RON
                  </option>
                ))}
              </select>
              {form.formState.errors.service && (
                <p
                  id="service-error"
                  className="text-red-500 text-sm mt-1 animate-pulse"
                  role="alert"
                >
                  {t("booking.serviceRequired")}
                </p>
              )}
            </div>
            {/* Selected Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="booking-selected-date"
                  className="block text-sm font-semibold text-heading mb-2"
                >
                  {t("booking.selectedDate")}
                </label>
                <input
                  id="booking-selected-date"
                  value={selectedDate ? formatDate(selectedDate) : ""}
                  readOnly
                  className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg"
                  aria-label={t("booking.selectedDate")}
                />
              </div>

              <div>
                <label
                  htmlFor="booking-selected-time"
                  className="block text-sm font-semibold text-heading mb-2"
                >
                  {t("booking.selectedTime")}
                </label>
                <input
                  id="booking-selected-time"
                  value={selectedTime || ""}
                  readOnly
                  className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg"
                  aria-label={t("booking.selectedTime")}
                />
              </div>
            </div>
            {/* Notes */}
            <div>
              <label
                htmlFor="booking-notes"
                className="block text-sm font-semibold text-heading mb-2"
              >
                {t("booking.notes")}
              </label>
              <textarea
                {...form.register("notes")}
                id="booking-notes"
                rows={3}
                className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                placeholder={t("booking.notesPlaceholder")}
                aria-label={t("booking.notes")}
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label={
                isSubmitting ? t("booking.submitting") : t("booking.submit")
              }
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t("booking.submitting")}
                </div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  {t("booking.submit")}
                </>
              )}
            </button>
            {/* Terms */}
            <div className="text-sm text-secondary text-center space-y-2">
              <p>
                {t("booking.termsText")}{" "}
                <a
                  href="/terms"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t(
                    "booking.terms"
                  )} - se deschide într-o fereastră nouă`}
                >
                  {t("booking.terms")}
                </a>{" "}
                {t("booking.and")}{" "}
                <a
                  href="/privacy"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t(
                    "booking.privacy"
                  )} - se deschide într-o fereastră nouă`}
                >
                  {t("booking.privacy")}
                </a>
                .
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-primary shadow-lg p-8 border-2 border-separator rounded-xl">
        <h4 className="text-2xl font-bold text-heading mb-6">
          {t("booking.infoTitle")}
        </h4>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent"
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
            </div>
            <div>
              <h5 className="font-semibold text-heading">
                {t("booking.duration")}
              </h5>
              <p className="text-secondary">{t("booking.durationText")}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-heading">
                {t("booking.confirmation")}
              </h5>
              <p className="text-secondary">{t("booking.confirmationText")}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-heading">
                {t("booking.cancellation")}
              </h5>
              <p className="text-secondary">{t("booking.cancellationText")}</p>
            </div>
          </div>
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
                {t("booking.successTitle")}
              </h3>
              <p className="text-secondary mb-6">
                {t("booking.successMessage")}
              </p>

              {/* Link-uri pentru gestionarea programării */}
              {/* <div className="space-y-3 mb-6">
                <p className="text-sm text-secondary">
                  Pentru a gestiona programarea, folosește link-urile din
                  email-ul de confirmare.
                </p>
                <div className="flex flex-col space-y-2">
                  <a
                    href={`/booking/modify/${bookingId || ""}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    ✏️ Modifică Programarea
                  </a>
                  <a
                    href={`/booking/cancel/${bookingId || ""}`}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    ❌ Anulează Programarea
                  </a>
                </div>
              </div> */}

              <button
                onClick={() => setShowSuccess(false)}
                className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                aria-label={t("booking.close")}
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
