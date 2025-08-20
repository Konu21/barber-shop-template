export interface SecurityEvent {
  timestamp: string;
  event: string;
  ip: string;
  userAgent: string;
  details: any;
}

export function logSecurityEvent(event: string, details: any) {
  const logEntry: SecurityEvent = {
    timestamp: new Date().toISOString(),
    event,
    ip: details.ip || "unknown",
    userAgent: details.userAgent || "unknown",
    details,
  };

  console.log("🔒 SECURITY EVENT:", JSON.stringify(logEntry));

  // În producție, salvează în baza de date sau serviciu de logging
  // Exemplu: await saveToDatabase('security_logs', logEntry);
}

export function logLoginAttempt(
  username: string,
  success: boolean,
  ip: string,
  userAgent: string
) {
  logSecurityEvent("login_attempt", {
    username,
    success,
    ip,
    userAgent,
  });
}

export function logApiAccess(
  endpoint: string,
  method: string,
  ip: string,
  userAgent: string
) {
  logSecurityEvent("api_access", {
    endpoint,
    method,
    ip,
    userAgent,
  });
}
