// JWT implementation pentru Edge Runtime
// Folosește Web Crypto API în loc de Node.js crypto

interface JWTPayload {
  [key: string]: any;
}

interface JWTHeader {
  alg: "HS256";
  typ: "JWT";
}

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to base64url string
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert base64url string to Uint8Array
function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + padding;
  const binary = atob(base64Padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Create HMAC-SHA256 signature
async function createSignature(
  payload: string,
  secret: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToUint8Array(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8Array(payload)
  );

  return arrayBufferToBase64Url(signature);
}

// Verify HMAC-SHA256 signature
async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToUint8Array(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const expectedSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToUint8Array(signature),
    stringToUint8Array(payload)
  );

  return expectedSignature;
}

// Sign JWT
export async function sign(
  payload: JWTPayload,
  secret: string
): Promise<string> {
  const header: JWTHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = arrayBufferToBase64Url(
    stringToUint8Array(JSON.stringify(header))
  );

  const encodedPayload = arrayBufferToBase64Url(
    stringToUint8Array(JSON.stringify(payload))
  );

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await createSignature(data, secret);

  return `${data}.${signature}`;
}

// Verify JWT
export async function verify(
  token: string,
  secret: string
): Promise<JWTPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify signature
  const data = `${encodedHeader}.${encodedPayload}`;
  const isValid = await verifySignature(data, signature, secret);

  if (!isValid) {
    throw new Error("Invalid JWT signature");
  }

  // Decode payload
  const payloadBytes = base64UrlToUint8Array(encodedPayload);
  const payloadString = new TextDecoder().decode(payloadBytes);
  const payload = JSON.parse(payloadString);

  // Check expiration
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error("JWT expired");
  }

  return payload;
}
