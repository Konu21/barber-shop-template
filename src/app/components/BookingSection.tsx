"use client";

import { useState, useContext } from "react";
import { LanguageContext } from "./LanguageProvider";
import Calendar from "./Calendar";
import BookingForm from "./BookingForm";

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const context = useContext(LanguageContext);

  if (!context) {
    return null;
  }

  const { t } = context;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  return (
    <section id="booking" className="py-20 ">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {t("booking.title")}
            </h3>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              {t("booking.subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />

            <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
