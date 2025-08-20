# 🚀 Vercel Deployment Guide

## 📋 Configurare Vercel

### 1. **Variabile de Mediu (Environment Variables)**

În dashboard-ul Vercel, adaugă următoarele variabile de mediu:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Google Calendar
GOOGLE_CALENDAR_ID="your-calendar-id@group.calendar.google.com"
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# App Configuration
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
GOOGLE_SITE_VERIFICATION="your-google-site-verification-code"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 2. **Database Setup**

Pentru PostgreSQL pe Vercel:

1. **Creează o bază de date PostgreSQL** (Vercel Postgres, Supabase, etc.)
2. **Actualizează DATABASE_URL** cu conexiunea ta
3. **Rulează migrațiile**:
   ```bash
   npx prisma db push
   ```

### 3. **Google Calendar Setup**

1. **Creează un Service Account** în Google Cloud Console
2. **Descarcă cheia privată** (JSON)
3. **Partajează calendarul** cu email-ul service account
4. **Configurează variabilele** GOOGLE_CALENDAR_ID și GOOGLE_PRIVATE_KEY

### 4. **Email Setup**

Pentru Gmail:

1. **Activează 2FA** pe contul Gmail
2. **Generează o parolă de aplicație**
3. **Configurează** EMAIL_USER și EMAIL_PASS

### 5. **Deployment**

1. **Conectează repository-ul** la Vercel
2. **Configurează variabilele de mediu**
3. **Deploy!**

## 🔧 Troubleshooting

### Erori comune:

1. **Database connection failed**

   - Verifică DATABASE_URL
   - Asigură-te că baza de date este accesibilă

2. **Google Calendar API errors**

   - Verifică GOOGLE_PRIVATE_KEY format
   - Asigură-te că calendarul este partajat

3. **Email sending failed**
   - Verifică credențialele Gmail
   - Asigură-te că parola de aplicație este corectă

## 📱 URLs importante

- **Homepage**: `https://your-domain.vercel.app`
- **Dashboard**: `https://your-domain.vercel.app/dashboard`
- **Login**: `https://your-domain.vercel.app/dashboard/login`

## 🔒 Securitate

- **Schimbă credențialele admin** după primul deploy
- **Folosește HTTPS** (automat pe Vercel)
- **Configurează rate limiting** dacă este necesar
