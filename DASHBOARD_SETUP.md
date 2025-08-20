# Dashboard Setup Guide

Această ghidă explică cum să configurezi și să folosești dashboard-ul pentru frizerie.

## 🔐 Autentificare

### Credențiale Default

- **Username**: `admin`
- **Password**: `admin123`

### Schimbarea Credențialelor

Pentru a schimba credențialele, editează fișierul `src/app/api/auth/login/route.ts`:

```typescript
// Schimbă aceste valori
const ADMIN_USERNAME = "your_username";
const ADMIN_PASSWORD = "your_secure_password";
```

## 📊 Funcționalități Dashboard

### 1. Statistici

- **Total Programări**: Programări confirmate și în așteptare din prezent în viitor
- **În Așteptare**: Programări care așteaptă confirmarea
- **Confirmate**: Programări aprobate
- **Anulate**: Programări anulate

### 2. Filtrare Programări

- **Toate**: Toate programările din prezent în viitor
- **Astăzi**: Programările de astăzi (doar confirmate)
- **Mâine**: Programările de mâine (doar confirmate)
- **Săptămâna aceasta**: Programările din această săptămână (doar confirmate)
- **În Așteptare**: Toate programările în așteptare
- **Trecute**: Programările din trecut

### 3. Acțiuni Disponibile

#### Pentru Programări în Așteptare:

- **Confirmă**: Aprobă programarea și o adaugă în Google Calendar
- **Anulează**: Respinge programarea

#### Pentru Programări Confirmate:

- **Anulează**: Anulează programarea și o șterge din Google Calendar

#### Pentru Toate Programările:

- **Editează**: Modifică data, ora sau statusul programării

## 🔧 Scripturi de Mentenanță

### Verificare Baza de Date

```bash
node scripts/check-database.js
```

### Curățare Programări Anulate

```bash
node scripts/cleanup-cancelled-bookings.js cancelled
```

### Curățare Programări Vechi

```bash
node scripts/cleanup-cancelled-bookings.js old 30
```

### Backup Programări

```bash
node scripts/backup-bookings.js create
node scripts/backup-bookings.js list
node scripts/backup-bookings.js restore <backup-file>
```

## 📧 Notificări Email

Dashboard-ul trimite automat email-uri pentru:

- **Confirmare programare**: Când o programare este aprobată
- **Anulare programare**: Când o programare este anulată
- **Modificare programare**: Când o programare este modificată

## 🔒 Securitate

### Recomandări:

1. **Schimbă credențialele default** imediat după setup
2. **Folosește HTTPS** în producție
3. **Configurează rate limiting** pentru API-uri
4. **Monitorizează log-urile** pentru activitate suspectă

### Variabile de Mediu Necesare:

```env
# Email (pentru notificări)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Next.js
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🚀 Deployment

### Pentru Vercel:

1. Configurează variabilele de mediu în dashboard-ul Vercel
2. Uploadează `google-credentials.json` ca fișier secret
3. Asigură-te că toate API-urile sunt funcționale

### Pentru alte platforme:

1. Configurează variabilele de mediu
2. Asigură-te că fișierele de credențiale sunt disponibile
3. Testează toate funcționalitățile

## 📞 Suport

Pentru probleme:

1. Verifică log-urile din consolă
2. Verifică că baza de date este funcțională
3. Verifică că Google Calendar API este configurat corect
4. Verifică că email-urile sunt configurate corect
