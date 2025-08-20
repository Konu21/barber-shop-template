# 🚀 VERCEL DEPLOYMENT OPTIMIZATION GUIDE

## 📋 **Environment Variables - Optimizări necesare:**

### 🔒 **1. SECURITATE:**

#### **JWT_SECRET** - Îmbunătățire:

```bash
# Actual (OK dar poate fi mai puternic):
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# RECOMANDAT (64+ caractere random):
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
```

**Cum generezi un JWT secret puternic:**

```bash
# Folosește Node.js pentru a genera:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Sau online: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### 📧 **2. EMAIL CONFIGURATION - PROBLEMA IDENTIFICATĂ:**

#### **Problema actuală:**

```bash
EMAIL_USER=paunbogdan2@gmail.com        # ✅ Corect
BARBER_EMAIL=paunbogdan2@gmail.com      # ⚠️ Ar trebui să fie diferit
CONTACT_EMAIL=paunbogdan2@gmail.com     # ⚠️ Ar trebui să fie diferit
```

#### **Configurația recomandată:**

```bash
EMAIL_USER=paunbogdan2@gmail.com        # Email pentru trimitere SMTP
BARBER_EMAIL=barber@elitebarber.ro      # Email-ul frizerului (pentru notificări)
CONTACT_EMAIL=contact@elitebarber.ro    # Email pentru contact (afișat pe site)
```

### 🗄️ **3. DATABASE - Lipsește:**

```bash
# ADAUGĂ:
DATABASE_URL=your-database-connection-string
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

---

## ⚡ **Performance Optimizations:**

### 1. **Bundle Size Optimization:**

```json
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@prisma/client'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
}
```

### 2. **Vercel Functions Optimization:**

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "nodejs20.x"
    }
  },
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 🔧 **Code Optimizations:**

### 1. **Database Connection Pooling:**

```typescript
// src/app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 2. **API Response Optimization:**

```typescript
// Adaugă cache headers
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  },
});
```

---

## 🛡️ **Security Improvements:**

### 1. **Rate Limiting:**

```typescript
// src/middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 2. **CORS Configuration:**

```typescript
// Add to API routes
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_BASE_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

---

## 📊 **Monitoring & Analytics:**

### 1. **Add Vercel Analytics:**

```bash
npm install @vercel/analytics
```

```tsx
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. **Error Monitoring:**

```typescript
// Add error logging to API routes
console.error("API Error:", {
  endpoint: request.url,
  method: request.method,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

---

## 🚀 **Deployment Checklist:**

### Before Deploy:

- [ ] Set strong JWT_SECRET (64+ chars)
- [ ] Configure different email addresses
- [ ] Add DATABASE_URL
- [ ] Set NEXT_PUBLIC_BASE_URL
- [ ] Upload Google credentials JSON
- [ ] Test all API endpoints
- [ ] Run `npm run build` locally
- [ ] Check bundle size (< 200KB)

### After Deploy:

- [ ] Test booking flow
- [ ] Test email notifications
- [ ] Test Google Calendar integration
- [ ] Check dashboard login
- [ ] Verify SSL certificate
- [ ] Run Lighthouse audit
- [ ] Test on mobile devices

---

## 📈 **Performance Targets:**

### Lighthouse Scores:

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Bundle Size Targets:

- **First Load JS**: < 200KB
- **Page Size**: < 500KB
- **API Response**: < 100ms
- **Database Query**: < 50ms

---

## 🔗 **Useful Commands:**

```bash
# Analyze bundle size
npm run build && npx @next/bundle-analyzer

# Test production build locally
npm run build && npm start

# Check for unused dependencies
npx depcheck

# Security audit
npm audit --audit-level high
```
