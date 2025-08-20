# 🗄️ VERCEL DATABASE SETUP GUIDE

## 📋 **Opțiunea 1: Vercel Postgres (RECOMANDATĂ)**

### **1. Creează database-ul în Vercel:**

1. Mergi la [Vercel Dashboard](https://vercel.com/dashboard)
2. Selectează proiectul tău
3. Mergi la tab-ul **"Storage"**
4. Click **"Create Database"**
5. Alege **"Postgres"**
6. Selectează planul **"Hobby"** (gratuit)
7. Alege regiunea **"Washington, D.C. (iad1)"**
8. Click **"Create"**

### **2. Configurează Environment Variables:**

Vercel va genera automat `DATABASE_URL`. Copiază-l din dashboard.

### **3. Actualizează Prisma Schema:**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... restul modelelor rămân la fel
```

### **4. Deploy Schema:**

```bash
# În Vercel, adaugă acest build command:
npx prisma db push
```

---

## 📋 **Opțiunea 2: Supabase (Alternativă)**

### **1. Creează cont Supabase:**

1. Mergi la [supabase.com](https://supabase.com)
2. Creează un cont gratuit
3. Creează un proiect nou

### **2. Configurează Database URL:**

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### **3. Actualizează Prisma Schema:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📋 **Opțiunea 3: PlanetScale (Alternativă)**

### **1. Creează cont PlanetScale:**

1. Mergi la [planetscale.com](https://planetscale.com)
2. Creează un cont gratuit
3. Creează un database nou

### **2. Configurează Database URL:**

```bash
DATABASE_URL=mysql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]
```

### **3. Actualizează Prisma Schema:**

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

## 🔧 **Configurare Environment Variables în Vercel:**

### **1. Mergi la Vercel Dashboard:**

1. Selectează proiectul tău
2. Mergi la **"Settings"** → **"Environment Variables"**

### **2. Adaugă variabilele:**

```bash
# Database
DATABASE_URL=your-database-connection-string

# Base URL (înlocuiește cu URL-ul tău Vercel)
NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app

# Email (folosește același email pentru toate)
EMAIL_USER=paunbogdan2@gmail.com
EMAIL_PASSWORD=iocb zoox fuxi uzyk
BARBER_EMAIL=paunbogdan2@gmail.com
CONTACT_EMAIL=paunbogdan2@gmail.com

# Google Calendar
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CALENDAR_ID=3fe65aa42b2af8021ac6a46dd5d57918d7f20f4fc46b0e7a8d4e08374d74aae2@group.calendar.google.com

# Dashboard
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=barber123

# JWT (generează unul nou puternic)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cron Secret (pentru cleanup)
CRON_SECRET=your-cron-secret-key
```

### **3. Upload Google Credentials:**

1. În Vercel Dashboard, mergi la **"Settings"** → **"Files"**
2. Upload fișierul `google-credentials.json`

---

## 🚀 **Deploy Steps:**

### **1. Push la GitHub:**

```bash
git add .
git commit -m "Add database and Vercel optimizations"
git push origin main
```

### **2. Vercel va detecta automat:**

- Vercel va rula `npm run build`
- Va genera Prisma Client
- Va conecta la database

### **3. Verifică deployment-ul:**

1. Mergi la URL-ul Vercel
2. Testează booking flow
3. Verifică dashboard login
4. Testează email notifications

---

## 🔍 **Troubleshooting:**

### **Problema: "Database connection failed"**

```bash
# Verifică DATABASE_URL în Vercel
# Asigură-te că database-ul este activ
# Verifică firewall settings
```

### **Problema: "Prisma Client not generated"**

```bash
# În Vercel, adaugă build command:
npm run build
# Sau
prisma generate && next build
```

### **Problema: "Environment variables not found"**

```bash
# Verifică că toate variabilele sunt setate în Vercel
# Asigură-te că nu au spații în jurul =
# Verifică că sunt în environment-ul corect (Production)
```

---

## 📊 **Monitoring:**

### **1. Vercel Analytics:**

- Mergi la **"Analytics"** în dashboard
- Monitorizează performance
- Verifică error rates

### **2. Database Monitoring:**

- Verifică connection pool
- Monitorizează query performance
- Verifică storage usage

---

## ✅ **Checklist Final:**

- [ ] Database creat și configurat
- [ ] DATABASE_URL setat în Vercel
- [ ] NEXT_PUBLIC_BASE_URL setat cu URL-ul Vercel
- [ ] Toate email-urile configurate
- [ ] Google credentials uploadate
- [ ] JWT_SECRET generat puternic
- [ ] Proiect deployat cu succes
- [ ] Booking flow testat
- [ ] Dashboard funcționează
- [ ] Email notifications funcționează
