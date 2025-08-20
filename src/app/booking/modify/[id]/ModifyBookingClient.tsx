"use client";

import { useContext } from "react";
import BookingManagement from "@/app/components/BookingManagement";
import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageToggle from "@/app/components/LanguageToggle";
import { LanguageContext } from "@/app/components/LanguageProvider";

interface ModifyBookingClientProps {
  bookingId: string;
}

export default function ModifyBookingClient({
  bookingId,
}: ModifyBookingClientProps) {
  const context = useContext(LanguageContext);

  if (!context) {
    return null;
  }

  const { t } = context;

  return (
    <div className="min-h-screen bg-primary">
      {/* Toggle-uri pentru temă și limbă */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-heading mb-4">
            {t("booking.modify.title")}
          </h1>
          <p className="text-muted text-lg">{t("booking.modify.subtitle")}</p>
        </div>

        <BookingManagement bookingId={bookingId} />
      </div>
    </div>
  );
}
