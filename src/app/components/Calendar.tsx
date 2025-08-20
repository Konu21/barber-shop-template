"use client";

import { useState, useContext, useEffect } from "react";
import { LanguageContext } from "./LanguageProvider";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const context = useContext(LanguageContext);

  // Funcție pentru a obține disponibilitatea din Google Calendar
  const fetchAvailability = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/availability?date=${date}`);
      const data = await response.json();

      if (data.success) {
        setAvailability(data.availability);
      } else {
        console.error("Error fetching availability:", data.error);
        setAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  // Obține disponibilitatea când se selectează o dată
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  if (!context) {
    return null;
  }

  const { t } = context;

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    // We want: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
    let startingDay = firstDay.getDay();
    startingDay = startingDay === 0 ? 6 : startingDay - 1;

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const formatDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    if (isPast(date) || isWeekend(date)) return;
    console.log(
      "Clicked date:",
      date.getDate(),
      "Formatted:",
      formatDate(date)
    );
    onDateSelect(formatDate(date));
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Generează sloturile de timp din disponibilitatea Google Calendar
  const getTimeSlots = () => {
    if (availability.length === 0) {
      // Fallback la sloturile statice dacă nu avem disponibilitate
      return [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
      ];
    }

    return availability
      .filter((slot) => slot.available)
      .map((slot) => {
        const startTime = new Date(slot.start);
        return startTime.toLocaleTimeString("ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      });
  };

  const timeSlots = getTimeSlots();

  const monthNames = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];

  return (
    <div className="bg-primary shadow-lg rounded-xl p-8 border-2 border-separator">
      <h4 className="text-2xl font-bold text-heading mb-6">
        {t("booking.calendarTitle")}
      </h4>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h5 className="text-lg font-semibold text-heading">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h5>
        <button
          onClick={nextMonth}
          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {/* Day headers */}
        {["L", "M", "Mi", "J", "V", "S", "D"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-secondary py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <div key={index} className="text-center">
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                disabled={isPast(day) || isWeekend(day)}
                className={`
                  w-10 h-10 rounded-lg text-sm font-medium transition-all
                  ${
                    isToday(day)
                      ? "bg-accent text-white"
                      : isSelected(day)
                      ? "bg-accent/20 text-accent border-2 border-accent"
                      : isPast(day) || isWeekend(day)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-heading hover:bg-accent/10 hover:text-accent cursor-pointer"
                  }
                `}
              >
                {day.getDate()}
              </button>
            ) : (
              <div className="w-10 h-10"></div>
            )}
          </div>
        ))}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="border-t border-separator pt-6">
          <h5 className="text-lg font-semibold text-heading mb-4">
            {t("booking.selectTime")}
          </h5>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-secondary">
                Se încarcă disponibilitatea...
              </span>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  className={`
                    py-3 px-4 rounded-lg text-sm font-medium transition-all
                    ${
                      selectedTime === time
                        ? "bg-accent text-white"
                        : "bg-secondary text-heading hover:bg-accent/10 hover:text-accent border border-separator"
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary">
                Nu sunt sloturi disponibile pentru această zi.
              </p>
              <p className="text-sm text-secondary mt-2">
                Te rugăm să selectezi o altă dată.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-separator">
        <div className="flex items-center justify-center space-x-4 text-sm text-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span>{t("booking.available")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>{t("booking.unavailable")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
