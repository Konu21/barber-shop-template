# Barber Shop Template - Cu Integrare Google Calendar

Un template modern pentru barber shop cu sistem complet de programări online, integrat cu Google Calendar și notificări automate prin email.

## ✨ Funcționalități

### 🗓️ Sistem de Programări

- **Calendar interactiv** cu disponibilitate în timp real
- **Integrare Google Calendar** - sincronizare automată cu calendarul tău
- **Sloturi de timp dinamice** - afișează doar orele disponibile
- **Validare în timp real** - previne programări duplicate

### 📧 Notificări Automate

- **Email de confirmare** către client cu detalii complete
- **Notificare către barber** pentru fiecare nouă programare
- **Reminder-uri automate** - 24 ore și 30 minute înainte
- **Email-uri de modificare/anulare** cu link-uri directe

### 🔧 Gestionare Programări

- **Modificare programări** - schimbă data, ora, serviciul
- **Anulare programări** - cu confirmare și notificări
- **Interfață intuitivă** pentru gestionarea programărilor
- **Sincronizare bidirecțională** cu Google Calendar

### 🎨 Design Modern

- **Interfață responsive** - funcționează pe toate dispozitivele
- **Tema întunecată** cu accenturi personalizabile
- **Animații fluide** și tranziții elegante
- **UX optimizat** pentru conversii

## 🚀 Instalare

### Cerințe

- Node.js 18+
- Cont Google Cloud
- Cont Gmail cu 2FA activat

### Pași de instalare

1. **Clonează repository-ul**

```bash
git clone <repository-url>
cd barber-shop-template
```

2. **Instalează dependențele**

```bash
npm install
```

3. **Configurează Google Calendar**

   - Urmărește ghidul din `GOOGLE_CALENDAR_SETUP.md`
   - Creează credențialele Google Cloud
   - Configurează email-ul pentru notificări

4. **Configurează variabilele de mediu**

```bash
cp env.example .env.local
# Editează .env.local cu valorile tale
```

5. **Pornește aplicația**

```bash
npm run dev
```

## ⚙️ Configurare

### Google Calendar Setup

Vezi `GOOGLE_CALENDAR_SETUP.md` pentru instrucțiuni detaliate.

### Variabile de Mediu

```env
# Google Calendar API
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Notifications
BARBER_EMAIL=barber@barbershop.com
CONTACT_EMAIL=contact@barbershop.com

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Personalizare

- **Ore de lucru**: Editează în `src/app/lib/google-calendar.ts`
- **Durata sloturilor**: Modifică `slotDuration` (implicit 30 min)
- **Template-uri email**: Personalizează în `src/app/lib/email-service.ts`
- **Servicii**: Editează în `src/app/data/services.ts`

## 📱 Utilizare

### Pentru Clienți

1. **Selectează o dată** din calendar
2. **Alege un slot disponibil** din lista de ore
3. **Completează formularul** cu detaliile personale
4. **Primește confirmarea** prin email
5. **Gestionează programarea** prin link-urile din email

### Pentru Barber

1. **Primește notificări** pentru fiecare programare
2. **Vezi toate programările** în Google Calendar
3. **Gestionează programările** prin interfața web
4. **Primește reminder-uri** automate

## 🔒 Securitate

- **Credențiale securizate** - nu sunt comise în Git
- **Validare server-side** pentru toate datele
- **Rate limiting** pentru API endpoints
- **Sanitizare date** pentru prevenirea XSS
- **HTTPS obligatoriu** în producție

## 🛠️ Structura Proiectului

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── availability/       # Disponibilitate calendar
│   │   └── bookings/          # Gestionare programări
│   ├── components/            # Componente React
│   │   ├── Calendar.tsx       # Calendar interactiv
│   │   ├── BookingForm.tsx    # Formular programări
│   │   └── BookingManagement.tsx # Gestionare programări
│   ├── lib/                   # Utilitare
│   │   ├── google-calendar.ts # Integrare Google Calendar
│   │   └── email-service.ts   # Serviciu email
│   └── data/                  # Date statice
│       └── services.ts        # Lista servicii
```

## 🚀 Deployment

### Vercel (Recomandat)

1. **Conectează repository-ul** la Vercel
2. **Configurează variabilele de mediu** în dashboard
3. **Uploadează fișierul** `google-credentials.json`
4. **Deploy automat** la fiecare push

### Alte Platforme

- **Netlify**: Similar cu Vercel
- **DigitalOcean**: Configurare manuală
- **AWS**: Folosește EC2 sau Lambda

## 🔧 Troubleshooting

### Probleme Comune

**Eroare "Invalid credentials"**

- Verifică dacă `google-credentials.json` există
- Verifică dacă calendarul este partajat cu service account

**Email-urile nu se trimit**

- Verifică dacă 2FA este activat
- Verifică parola de aplicație
- Verifică setările SMTP

**Sloturile nu se încarcă**

- Verifică dacă Google Calendar API este activat
- Verifică console-ul pentru erori
- Verifică log-urile server-ului

### Debug

```bash
# Verifică log-urile
npm run dev

# Testează API-ul
curl http://localhost:3000/api/availability?date=2024-01-15

# Verifică variabilele de mediu
echo $GOOGLE_APPLICATION_CREDENTIALS
```

## 📈 Monitorizare

### Metrice Importante

- **Rate de conversie** programări
- **Timp de răspuns** API
- **Rate de eroare** email-uri
- **Utilizare calendar** (sloturi ocupate vs disponibile)

### Log-uri

- **API calls** - în console-ul server-ului
- **Email delivery** - în serviciul de email
- **Calendar sync** - în Google Cloud Console

## 🤝 Contribuții

1. **Fork** repository-ul
2. **Creează** o branch pentru feature
3. **Commit** schimbările
4. **Push** la branch
5. **Creează** Pull Request

## 📄 Licență

Acest proiect este licențiat sub MIT License - vezi [LICENSE](LICENSE) pentru detalii.

## 🆘 Suport

Pentru întrebări și suport:

- **Issues**: Creează un issue pe GitHub
- **Email**: contact@barbershop.com
- **Documentație**: Vezi `GOOGLE_CALENDAR_SETUP.md`

---

**Făcut cu ❤️ pentru barber shop-urile moderne**
