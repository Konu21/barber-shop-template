// Configurare Content Security Policy
export const cspConfig = {
  // Directives de bază
  "default-src": ["'self'"],

  // Scripts - permite Next.js și Google Analytics
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Pentru Next.js
    "'unsafe-eval'", // Pentru Next.js development
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://ssl.google-analytics.com",
  ],

  // Styles - permite Google Fonts
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Pentru Tailwind CSS
    "https://fonts.googleapis.com",
  ],

  // Fonts - permite Google Fonts
  "font-src": ["'self'", "https://fonts.gstatic.com"],

  // Images - permite imagini externe și data URLs
  "img-src": ["'self'", "data:", "https:", "blob:"],

  // Conectări - permite API-uri externe
  "connect-src": [
    "'self'",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://www.googleapis.com", // Pentru Google Calendar
  ],

  // Frames - restricționează iframe-urile
  "frame-src": [
    "'self'",
    "https://www.google.com",
    "https://maps.google.com",
    "https://www.google.com/maps",
  ],

  // Objects - blochează plugin-urile
  "object-src": ["'none'"],

  // Base URI - restricționează la domeniul propriu
  "base-uri": ["'self'"],

  // Form actions - restricționează la domeniul propriu
  "form-action": ["'self'"],

  // Frame ancestors - previne clickjacking
  "frame-ancestors": ["'none'"],

  // Upgrade insecure requests
  "upgrade-insecure-requests": [],
};

// Funcție pentru a genera CSP header
export function generateCSPHeader(): string {
  const directives = Object.entries(cspConfig)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(" ")}`;
    })
    .join("; ");

  return directives;
}

// Headers de securitate suplimentari
export const securityHeaders = {
  // Previne clickjacking
  "X-Frame-Options": "DENY",

  // Previne MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (fost Feature Policy)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",

  // Strict Transport Security (HSTS)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // XSS Protection (pentru browsere mai vechi)
  "X-XSS-Protection": "1; mode=block",
};

// Configurare pentru diferite medii
export const environmentConfig = {
  development: {
    csp: {
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Necesar pentru Next.js development
      ],
      "frame-src": [
        "'self'",
        "https://www.google.com",
        "https://maps.google.com",
        "https://www.google.com/maps",
      ],
    },
  },
  production: {
    csp: {
      "script-src": [
        "'self'",
        "'unsafe-inline'", // Păstrat pentru Next.js
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
    },
  },
};
