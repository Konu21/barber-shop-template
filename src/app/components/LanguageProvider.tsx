"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { servicesTranslations } from "../translations/services";

type Language = "en" | "ro";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionary
const translations = {
  en: {
    // Header
    title: "Modern Barber Shop",
    subtitle:
      "Experience the perfect blend of tradition and modern style. Professional grooming services in a contemporary setting.",

    // Hero Section
    "hero.title.line1": "The Perfect Style",
    "hero.title.line2": "For the Modern Man",
    "hero.subtitle":
      "Premium barbering experience with over 15 years of expertise in the art of men's grooming",
    "hero.bookNow": "Book Now",
    "hero.viewServices": "View Services",

    // About
    "about.title": "About Your Barber",
    "about.barberName": "Marian Popescu",
    "about.description":
      "With over 15 years of experience in the men's beauty industry, I specialize in classic and modern haircuts, beard styling, and complete grooming for the contemporary man.",
    "about.certification": "International Barbering Certification",
    "about.clients": "Over 5000 satisfied clients",
    "about.rating": "Average rating 4.9/5 stars",

    // Location
    "location.title": "Our Location",
    "location.contactInfo": "Contact Information",
    "location.address.title": "Address",
    "location.address.street": "Strada Republicii nr. 15",
    "location.address.city": "Cluj-Napoca, Cluj",
    "location.phone.title": "Phone",
    "location.phone.number": "+40 756 123 456",
    "location.hours.title": "Opening Hours",
    "location.hours.monFri": "Monday - Friday: 09:00 - 19:00",
    "location.hours.saturday": "Saturday: 09:00 - 17:00",
    "location.hours.sunday": "Sunday: Closed",
    "location.email.title": "Email",
    "location.email.address": "contact@barbershopelite.ro",
    "location.map.title": "Google Maps Integration",
    "location.map.description": "Map will be integrated here",

    // Booking
    "booking.title": "Book Your Appointment",
    "booking.subtitle": "Reserve your spot and get the perfect cut you deserve",
    "booking.calendarTitle": "Choose Date and Time",
    "booking.formTitle": "Booking Details",
    "booking.name": "Full Name",
    "booking.namePlaceholder": "Enter your name",
    "booking.nameRequired": "Name is required",
    "booking.phone": "Phone Number",
    "booking.phoneRequired": "Phone number is required",
    "booking.phoneInvalid":
      "Phone number can only contain digits, spaces, + and -",
    "booking.phoneLength": "Phone number must be between 10 and 13 digits",
    "booking.phoneFormat": "Please enter a valid Romanian phone number format",
    "booking.email": "Email",
    "booking.emailInvalid": "Please enter a valid email address",
    "booking.optional": "optional",
    "booking.service": "Desired Service",
    "booking.selectService": "Select service",
    "booking.serviceRequired": "Service is required",
    "booking.date": "Date",
    "booking.time": "Time",
    "booking.selectTime": "Select time",
    "booking.selectedDate": "Selected Date",
    "booking.selectedTime": "Selected Time",
    "booking.selectDateAndTime": "Please select date and time",
    "booking.notes": "Notes",
    "booking.notesPlaceholder": "Mention any special requirements...",
    "booking.submit": "Send Booking Request",
    "booking.submitting": "Sending...",
    "booking.confirmation":
      "You will receive a confirmation via SMS/email as soon as possible.",
    "booking.termsText": "By submitting this form, you accept the",
    "booking.terms": "Terms and Conditions",
    "booking.and": "and",
    "booking.privacy": "Privacy Policy",
    "booking.infoTitle": "Booking Information",
    "booking.duration": "Duration",
    "booking.durationText": "Most services take 30-60 minutes",
    "booking.confirmationText": "You'll receive confirmation within 2 hours",
    "booking.cancellation": "Cancellation",
    "booking.cancellationText": "Free cancellation up to 24 hours before",
    "booking.contactTitle": "Contact Information",
    "booking.successTitle": "Booking Successful!",
    "booking.successMessage":
      "Your appointment has been booked successfully. We'll contact you shortly to confirm.",
    "booking.close": "Close",
    "booking.available": "Available",
    "booking.unavailable": "Unavailable",

    // Contact
    "contact.title": "Get in Touch",
    "contact.info": "Contact Information",
    "contact.hours": "Opening Hours",
    "contact.mon-fri": "Monday - Friday: 9:00 AM - 8:00 PM",
    "contact.saturday": "Saturday: 9:00 AM - 6:00 PM",
    "contact.sunday": "Sunday: 10:00 AM - 4:00 PM",

    // Navigation
    "nav.about": "About",
    "nav.services": "Services",
    "nav.location": "Location",
    "nav.booking": "Booking",
    "nav.bookNow": "Book Now",

    // Language toggle
    "language.en": "English",
    "language.ro": "Romanian",

    // Services translations
    ...servicesTranslations.en,
  },
  ro: {
    // Header
    title: "Frizerie Modernă",
    subtitle:
      "Experimentează amestecul perfect între tradiție și stil modern. Servicii profesionale de înfrumusețare într-un cadru contemporan.",

    // Hero Section
    "hero.title.line1": "Stilul Perfect",
    "hero.title.line2": "Pentru Bărbatul Modern",
    "hero.subtitle":
      "Experiență premium de frizerie cu peste 15 ani de experiență în arta coafurii masculine",
    "hero.bookNow": "Programează-te Acum",
    "hero.viewServices": "Vezi Serviciile",

    // About
    "about.title": "Despre Frizerul Tău",
    "about.barberName": "Marian Popescu",
    "about.description":
      "Cu peste 15 ani de experiență în industria frumuseții masculine, sunt specializat în tunderi clasice și moderne, stilizare barbă și îngrijire completă pentru bărbatul contemporan.",
    "about.certification": "Certificat Internațional în Barbering",
    "about.clients": "Peste 5000 de clienți mulțumiți",
    "about.rating": "Rating mediu 4.9/5 stele",

    // Location
    "location.title": "Locația Noastră",
    "location.contactInfo": "Informații Contact",
    "location.address.title": "Adresă",
    "location.address.street": "Strada Republicii nr. 15",
    "location.address.city": "Cluj-Napoca, Cluj",
    "location.phone.title": "Telefon",
    "location.phone.number": "+40 756 123 456",
    "location.hours.title": "Program",
    "location.hours.monFri": "Luni - Vineri: 09:00 - 19:00",
    "location.hours.saturday": "Sâmbătă: 09:00 - 17:00",
    "location.hours.sunday": "Duminică: Închis",
    "location.email.title": "Email",
    "location.email.address": "contact@barbershopelite.ro",
    "location.map.title": "Integrare Google Maps",
    "location.map.description": "Harta va fi integrată aici",

    // Booking
    "booking.title": "Programează-te",
    "booking.subtitle":
      "Rezervă locul tău și obține tunsoarea perfectă pe care o meriți",
    "booking.calendarTitle": "Alege Data și Ora",
    "booking.formTitle": "Detalii Programare",
    "booking.name": "Nume Complet",
    "booking.namePlaceholder": "Introduceți numele dvs.",
    "booking.nameRequired": "Numele este obligatoriu",
    "booking.phone": "Număr de Telefon",
    "booking.phoneRequired": "Numărul de telefon este obligatoriu",
    "booking.phoneInvalid":
      "Numărul de telefon poate conține doar cifre, spații, + și -",
    "booking.phoneLength":
      "Numărul de telefon trebuie să aibă între 10 și 13 cifre",
    "booking.phoneFormat":
      "Vă rugăm să introduceți un format valid de număr de telefon românesc",
    "booking.email": "Email",
    "booking.emailInvalid": "Vă rugăm să introduceți o adresă de email validă",
    "booking.optional": "opțional",
    "booking.service": "Serviciu Dorit",
    "booking.selectService": "Selectați serviciul",
    "booking.serviceRequired": "Serviciul este obligatoriu",
    "booking.date": "Data",
    "booking.time": "Ora",
    "booking.selectTime": "Selectați ora",
    "booking.selectedDate": "Data Selectată",
    "booking.selectedTime": "Ora Selectată",
    "booking.selectDateAndTime": "Te rugăm să selectezi data și ora",
    "booking.notes": "Observații",
    "booking.notesPlaceholder": "Menționați orice cerințe speciale...",
    "booking.submit": "Trimite Cererea de Programare",
    "booking.submitting": "Se trimite...",
    "booking.confirmation":
      "Veți primi o confirmare prin SMS/email în cel mai scurt timp.",
    "booking.termsText": "Prin trimiterea acestui formular, acceptați",
    "booking.terms": "Termenii și Condițiile",
    "booking.and": "și",
    "booking.privacy": "Politica de Confidențialitate",
    "booking.infoTitle": "Informații Programare",
    "booking.duration": "Durata",
    "booking.durationText": "Majoritatea serviciilor durează 30-60 minute",
    "booking.confirmationText": "Veți primi confirmarea în 2 ore",
    "booking.cancellation": "Anulare",
    "booking.cancellationText": "Anulare gratuită până la 24 ore înainte",
    "booking.contactTitle": "Informații Contact",
    "booking.successTitle": "Programare Reușită!",
    "booking.successMessage":
      "Programarea ta a fost făcută cu succes. Te vom contacta în curând pentru confirmare.",
    "booking.close": "Închide",
    "booking.available": "Disponibil",
    "booking.unavailable": "Indisponibil",

    // Contact
    "contact.title": "Contactează-ne",
    "contact.info": "Informații Contact",
    "contact.hours": "Program de Funcționare",
    "contact.mon-fri": "Luni - Vineri: 9:00 - 20:00",
    "contact.saturday": "Sâmbătă: 9:00 - 18:00",
    "contact.sunday": "Duminică: 10:00 - 16:00",

    // Navigation
    "nav.about": "Despre",
    "nav.services": "Servicii",
    "nav.location": "Locație",
    "nav.booking": "Programare",
    "nav.bookNow": "Rezervă Acum",

    // Language toggle
    "language.en": "English",
    "language.ro": "Română",

    // Services translations
    ...servicesTranslations.ro,
  },
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update localStorage
      localStorage.setItem("language", language);
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ro" : "en"));
  };

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
