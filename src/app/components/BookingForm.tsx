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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Booking data:", {
      ...data,
      date: selectedDate,
      time: selectedTime,
    });
    setIsSubmitting(false);
    setShowSuccess(true);
    form.reset();
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
      <div className="bg-primary shadow-lg rounded-xl border-2 border-separator rounded-xl">
        <div className="p-8">
          <h4 className="text-2xl font-bold text-heading mb-6">
            {t("booking.formTitle")}
          </h4>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-heading mb-2">
                {t("booking.name")} *
              </label>
              <input
                {...form.register("name", { required: true })}
                type="text"
                className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                placeholder={t("booking.namePlaceholder")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {t("booking.nameRequired")}
                </p>
              )}
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-heading mb-2">
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
                        digitsOnly.length === 12
                      )
                        return true;
                      if (
                        digitsOnly.startsWith("0") &&
                        digitsOnly.length === 10
                      )
                        return true;
                      if (digitsOnly.startsWith("7") && digitsOnly.length === 9)
                        return true;
                      return t("booking.phoneFormat");
                    },
                  },
                })}
                type="tel"
                className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                placeholder="+40 7XX XXX XXX"
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-heading mb-2">
                {t("booking.email")} ({t("booking.optional")})
              </label>
              <input
                {...form.register("email")}
                type="email"
                className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                placeholder="email@exemplu.com"
              />
            </div>
            {/* Service */}
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
                  <option
                    className="text-heading"
                    key={service.id}
                    value={service.id}
                  >
                    {t(`services.${service.id}.name`)} - {service.price} LEI
                  </option>
                ))}
              </select>
              {form.formState.errors.service && (
                <p className="text-red-500 text-sm mt-1">
                  {t("booking.serviceRequired")}
                </p>
              )}
            </div>
            {/* Selected Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-heading mb-2">
                  {t("booking.selectedDate")}
                </label>
                <input
                  value={selectedDate ? formatDate(selectedDate) : ""}
                  readOnly
                  className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-2">
                  {t("booking.selectedTime")}
                </label>
                <input
                  value={selectedTime || ""}
                  readOnly
                  className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg"
                />
              </div>
            </div>
            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-heading mb-2">
                {t("booking.notes")} ({t("booking.optional")})
              </label>
              <textarea
                {...form.register("notes")}
                rows={3}
                className="w-full px-4 py-3 bg-secondary text-heading border border-separator rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                placeholder={t("booking.notesPlaceholder")}
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <p>{t("booking.confirmation")}</p>
              <p>
                {t("booking.termsText")}{" "}
                <a
                  href="/terms"
                  className="text-accent hover:underline"
                  target="_blank"
                >
                  {t("booking.terms")}
                </a>{" "}
                {t("booking.and")}{" "}
                <a
                  href="/privacy"
                  className="text-accent hover:underline"
                  target="_blank"
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
              <button
                onClick={() => setShowSuccess(false)}
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
