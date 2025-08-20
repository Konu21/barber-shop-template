# Google Calendar Setup Guide

Această ghidă explică cum să configurezi Google Calendar pentru aplicația de frizerie.

## 📋 Pași de Configurare

### 1. Creează un Proiect Google Cloud

1. Mergi la [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un proiect nou sau selectează unul existent
3. Activează Google Calendar API pentru proiect

### 2. Configurează Credențialele

1. În Google Cloud Console, mergi la "APIs & Services" > "Credentials"
2. Creează un "Service Account"
3. Descarcă fișierul JSON cu credențialele
4. Redenumește-l în `google-credentials.json` și pune-l în rădăcina proiectului

### 3. Configurează Calendarul

1. Deschide [Google Calendar](https://calendar.google.com/)
2. Creează un calendar nou pentru frizerie
3. Împărtășește calendarul cu email-ul din Service Account
4. Copiază ID-ul calendarului (din setările calendarului)

### 4. Configurează Variabilele de Mediu

Creează un fișier `.env.local` în rădăcina proiectului:

```env
# Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id_here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"
```

### 5. Testează Configurarea

Rulează scriptul de test pentru a verifica configurarea:

```bash
node scripts/check-calendar-access.js
```

## 🔧 Scripturi Utile

### Verificare Acces Calendar

```bash
node scripts/check-calendar-access.js
```

### Listare Evenimente

```bash
node scripts/list-events.js
```

### Găsire ID Calendar

```bash
node scripts/find-calendar-id.js
```

## ⚠️ Important

- **Nu comite** `google-credentials.json` în Git
- **Nu comite** `.env.local` în Git
- Păstrează credențialele în siguranță
- Folosește variabile de mediu pentru producție

## 🚀 Pentru Producție

1. Creează credențiale separate pentru producție
2. Configurează variabilele de mediu pe server
3. Asigură-te că calendarul este public sau partajat corect
4. Testează funcționalitatea înainte de deploy

## 📞 Suport

Dacă întâmpini probleme:

1. Verifică că API-ul este activat
2. Verifică că credențialele sunt corecte
3. Verifică că calendarul este partajat
4. Verifică log-urile pentru erori
