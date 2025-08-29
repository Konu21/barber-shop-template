"use client";

import { useState, useContext, useEffect } from "react";
import { LanguageContext } from "./LanguageProvider";
import Calendar from "./Calendar";
import BookingForm from "./BookingForm";

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Adaugă state pentru data curentă

  const context = useContext(LanguageContext);

  // Funcție pentru a verifica dacă o dată este weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Funcție pentru a verifica dacă o dată este în trecut
  const isPast = (date: Date) => {
    const today = new Date(currentDate); // Folosește currentDate în loc de new Date()
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Funcție pentru a formata data
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Actualizează data curentă la fiecare refresh și la intervale regulate
  useEffect(() => {
    const updateCurrentDate = () => {
      setCurrentDate(new Date());
    };

    // Actualizează imediat
    updateCurrentDate();

    // Actualizează la fiecare minut pentru a fi sigur că data este corectă
    const interval = setInterval(updateCurrentDate, 60000);

    return () => clearInterval(interval);
  }, []);

  // Inițializează cu data curentă dacă este disponibilă
  useEffect(() => {
    if (!isInitialized && !selectedDate) {
      const today = new Date(currentDate); // Folosește currentDate

      // Verifică dacă azi este disponibil (nu weekend și nu în trecut)
      if (!isWeekend(today) && !isPast(today)) {
        setSelectedDate(formatDate(today));
      } else {
        // Găsește următoarea dată disponibilă
        const nextAvailableDate = new Date(today);
        let attempts = 0;

        while (
          (isWeekend(nextAvailableDate) || isPast(nextAvailableDate)) &&
          attempts < 14
        ) {
          nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
          attempts++;
        }

        if (attempts < 14) {
          setSelectedDate(formatDate(nextAvailableDate));
        }
      }

      setIsInitialized(true);
    }
  }, [isInitialized, selectedDate, currentDate]); // Adaugă currentDate la dependencies

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
