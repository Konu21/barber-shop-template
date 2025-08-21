import nodemailer from "nodemailer";
import { BookingRequest } from "./google-calendar";

// Configurare transporter pentru email
const transporter = nodemailer.createTransport({
  service: "gmail", // sau alt serviciu de email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Parola de aplicație pentru Gmail
  },
});

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

// Template pentru email de confirmare programare
export function createBookingConfirmationEmail(
  booking: BookingRequest,
  bookingId: string
): EmailNotification {
  const formattedDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "Confirmare Programare - Barber Shop",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button.cancel { background: #ef4444; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Confirmare Programare</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Programarea ta a fost confirmată cu succes.</p>
            
            <div class="booking-details">
              <h3>📅 Detalii Programare</h3>
              <p><strong>Data și ora:</strong> ${formattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>Telefon:</strong> ${booking.phone}</p>
              ${
                booking.notes
                  ? `<p><strong>Note:</strong> ${booking.notes}</p>`
                  : ""
              }
              <p><strong>ID Programare:</strong> ${bookingId}</p>
            </div>
            
            <p>Pentru a modifica sau anula programarea, folosește butoanele de mai jos:</p>
            
                         <div style="text-align: center;">
               <a href="${
                 process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
               }/booking/modify/${bookingId}" class="button">
                 ✏️ Modifică Programarea
               </a>
               <a href="${
                 process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
               }/booking/cancel/${bookingId}" class="button cancel">
                 ❌ Anulează Programarea
               </a>
             </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 6px;">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>Te rugăm să vii cu 5 minute înainte de programare</li>
                <li>Pentru anulare, contactează-ne cu cel puțin 2 ore înainte</li>
                <li>În caz de întârziere, programarea poate fi reprogramată</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Template pentru email de notificare pentru barber
export function createBarberNotificationEmail(
  booking: BookingRequest,
  bookingId: string
): EmailNotification {
  const formattedDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: process.env.BARBER_EMAIL || "barber@barbershop.com",
    subject: `Nouă Programare - ${booking.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Nouă Programare</h1>
            <p>Client: ${booking.name}</p>
          </div>
          
          <div class="content">
            <h2>Detalii Programare</h2>
            
            <div class="booking-details">
              <p><strong>📅 Data și ora:</strong> ${formattedDate}</p>
              <p><strong>👤 Client:</strong> ${booking.name}</p>
              <p><strong>📞 Telefon:</strong> ${booking.phone}</p>
              <p><strong>📧 Email:</strong> ${booking.email || "N/A"}</p>
              <p><strong>✂️ Serviciu:</strong> ${booking.service}</p>
              ${
                booking.notes
                  ? `<p><strong>📝 Note:</strong> ${booking.notes}</p>`
                  : ""
              }
              <p><strong>🆔 ID Programare:</strong> ${bookingId}</p>
            </div>
            
                         <div style="text-align: center;">
               <a href="${
                 process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
               }/admin/bookings" class="button">
                 👨‍💼 Vezi Toate Programările
               </a>
             </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Sistem de Programări</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Template pentru email de anulare programare
export function createBookingCancellationEmail(
  booking: BookingRequest,
  bookingId: string
): EmailNotification {
  const formattedDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "Programare Anulată - Barber Shop",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Programare Anulată</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Programarea ta a fost anulată cu succes.</p>
            
            <div class="booking-details">
              <h3>📅 Programare Anulată</h3>
              <p><strong>Data și ora:</strong> ${formattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>ID Programare:</strong> ${bookingId}</p>
            </div>
            
            <p>Dacă dorești să faci o nouă programare, folosește butonul de mai jos:</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/booking" class="button">
                📅 Programează Din Nou
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 6px;">
              <p><strong>💡 Sfaturi:</strong></p>
              <ul>
                <li>Poți face o nouă programare oricând</li>
                <li>Pentru programări urgente, contactează-ne telefonic</li>
                <li>Mulțumim pentru înțelegere!</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Funcție pentru crearea email-ului de aprobare
function createBookingApprovalEmail(
  booking: BookingRequest,
  bookingId: string
): EmailNotification {
  const formattedDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "✅ Programarea ta a fost aprobată!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Programare Aprobată!</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Programarea ta a fost aprobată de frizer! 🎉</p>
            
            <div class="booking-details">
              <h3>📅 Detalii Programare</h3>
              <p><strong>Data și ora:</strong> ${formattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>ID Programare:</strong> ${bookingId}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #d1fae5; border-radius: 6px;">
              <p><strong>✅ Programarea ta este confirmată!</strong></p>
              <p>Te așteptăm la programarea stabilită. Pentru modificări, contactează-ne telefonic.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Funcție pentru crearea email-ului de respingere
function createBookingRejectionEmail(
  booking: BookingRequest,
  bookingId: string,
  reason: string
): EmailNotification {
  const formattedDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "❌ Programarea ta a fost respinsă",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Programare Respinsă</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Ne pare rău, dar programarea ta a fost respinsă.</p>
            
            <div class="booking-details">
              <h3>📅 Programare Respinsă</h3>
              <p><strong>Data și ora:</strong> ${formattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>ID Programare:</strong> ${bookingId}</p>
              <p><strong>Motiv:</strong> ${reason}</p>
            </div>
            
            <p>Poți face o nouă programare folosind butonul de mai jos:</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/booking" class="button">
                📅 Programează Din Nou
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Funcție pentru crearea email-ului de reprogramare
function createBookingRescheduleEmail(
  booking: BookingRequest,
  bookingId: string,
  newDate: string,
  newTime: string,
  reason: string
): EmailNotification {
  const originalDate = new Date(
    `${booking.date}T${booking.time}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newFormattedDate = new Date(
    `${newDate}T${newTime}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "🔄 Programarea ta a fost reprogramată",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Programare Reprogramată</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Programarea ta a fost reprogramată de frizer.</p>
            
            <div class="booking-details">
              <h3>📅 Detalii Reprogramare</h3>
              <p><strong>Data și ora originală:</strong> ${originalDate}</p>
              <p><strong>Noua dată și oră:</strong> ${newFormattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>ID Programare:</strong> ${bookingId}</p>
              <p><strong>Motiv:</strong> ${reason}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 6px;">
              <p><strong>🔄 Programarea ta a fost reprogramată!</strong></p>
              <p>Te așteptăm la noua dată stabilită. Pentru modificări, contactează-ne telefonic.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Funcție pentru crearea email-ului de confirmare modificare programare
export function createBookingModificationEmail(
  booking: BookingRequest,
  bookingId: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
): EmailNotification {
  const oldFormattedDate = new Date(
    `${oldDate}T${oldTime}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newFormattedDate = new Date(
    `${newDate}T${newTime}:00`
  ).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    to: booking.email!,
    subject: "🔄 Confirmare Modificare Programare - Barber Shop",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button.confirm { background: #10b981; }
          .button.reject { background: #ef4444; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Barber Shop</h1>
            <p>Confirmare Modificare Programare</p>
          </div>
          
          <div class="content">
            <h2>Salut ${booking.name}!</h2>
            <p>Frizerul a propus o modificare a programării tale. Te rugăm să confirmi sau să respingi această modificare.</p>
            
            <div class="booking-details">
              <h3>📅 Detalii Modificare</h3>
              <p><strong>Data și ora originală:</strong> ${oldFormattedDate}</p>
              <p><strong>Noua dată și oră propusă:</strong> ${newFormattedDate}</p>
              <p><strong>Serviciu:</strong> ${booking.service}</p>
              <p><strong>Telefon:</strong> ${booking.phone}</p>
              ${
                booking.notes
                  ? `<p><strong>Note:</strong> ${booking.notes}</p>`
                  : ""
              }
              <p><strong>ID Programare:</strong> ${bookingId}</p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <p>Programarea va fi modificată doar după confirmarea ta. Dacă nu confirmi în următoarele 24 de ore, programarea va rămâne la data și ora originală.</p>
            </div>
            
                         <div style="text-align: center;">
               <a href="${
                 process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
               }/api/bookings/${bookingId}/confirm-modification?date=${newDate}&time=${newTime}" class="button confirm">
                 ✅ Confirmă Modificarea
               </a>
               <a href="${
                 process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
               }/api/bookings/${bookingId}/reject-modification" class="button reject">
                 ❌ Respinge Modificarea
               </a>
             </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 6px;">
              <p><strong>📞 Pentru întrebări:</strong></p>
              <p>Dacă ai întrebări despre această modificare, nu ezita să ne contactezi telefonic.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Barber Shop - Programări Online</p>
            <p>Pentru întrebări: ${
              process.env.CONTACT_EMAIL || "contact@barbershop.com"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Funcție pentru trimiterea email-ului
export async function sendEmail(
  notification: EmailNotification
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Eroare la trimiterea email-ului:", error);
    return false;
  }
}

// Funcție pentru trimiterea notificărilor pentru o programare
export async function sendBookingNotifications(
  booking: BookingRequest,
  bookingId: string
): Promise<void> {
  try {
    // Trimite email de confirmare către client (obligatoriu acum)
    if (booking.email) {
      const clientEmail = createBookingConfirmationEmail(booking, bookingId);
      await sendEmail(clientEmail);
    }
  } catch (error) {
    console.error("Eroare la trimiterea notificărilor:", error);
  }
}

// Funcție pentru trimiterea email-ului de aprobare către client
export async function sendBookingApprovalEmail(
  booking: BookingRequest,
  bookingId: string
): Promise<void> {
  try {
    if (booking.email) {
      const emailContent = createBookingApprovalEmail(booking, bookingId);
      await sendEmail(emailContent);
    }
  } catch (error) {
    console.error("Eroare la trimiterea email-ului de aprobare:", error);
  }
}

// Funcție pentru trimiterea email-ului de respingere către client
export async function sendBookingRejectionEmail(
  booking: BookingRequest,
  bookingId: string,
  reason: string
): Promise<void> {
  try {
    if (booking.email) {
      const emailContent = createBookingRejectionEmail(
        booking,
        bookingId,
        reason
      );
      await sendEmail(emailContent);
    }
  } catch (error) {
    console.error("Eroare la trimiterea email-ului de respingere:", error);
  }
}

// Funcție pentru trimiterea email-ului de reprogramare către client
export async function sendBookingRescheduleEmail(
  booking: BookingRequest,
  bookingId: string,
  newDate: string,
  newTime: string,
  reason: string
): Promise<void> {
  try {
    if (booking.email) {
      const emailContent = createBookingRescheduleEmail(
        booking,
        bookingId,
        newDate,
        newTime,
        reason
      );
      await sendEmail(emailContent);
    }
  } catch (error) {
    console.error("Eroare la trimiterea email-ului de reprogramare:", error);
  }
}

// Funcție pentru trimiterea email-ului de confirmare modificare
export async function sendBookingModificationEmail(
  booking: BookingRequest,
  bookingId: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
): Promise<void> {
  try {
    if (booking.email) {
      const emailContent = createBookingModificationEmail(
        booking,
        bookingId,
        oldDate,
        oldTime,
        newDate,
        newTime
      );
      await sendEmail(emailContent);
    }
  } catch (error) {
    console.error(
      "❌ Eroare la trimiterea email-ului de confirmare modificare:",
      error
    );
  }
}

export async function sendBookingCancellationEmail(
  booking: {
    name: string;
    phone: string;
    email?: string;
    service: string;
    date: string;
    time: string;
    notes?: string;
  },
  bookingId: string,
  reason?: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.email || process.env.BARBER_EMAIL,
      subject: "Programare Anulată - Barber Shop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Programare Anulată</h2>
          <p>Salut ${booking.name},</p>
          <p>Programarea ta pentru <strong>${
            booking.service
          }</strong> din data de <strong>${booking.date} la ${
        booking.time
      }</strong> a fost anulată.</p>
          
          ${reason ? `<p><strong>Motiv:</strong> ${reason}</p>` : ""}
          
          <p>Pentru a face o nouă programare, te rugăm să vizitezi site-ul nostru.</p>
          
          <p>Mulțumim pentru înțelegere!</p>
          <p>Echipa Barber Shop</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
}
