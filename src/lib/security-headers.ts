
// Enhanced security headers with stricter CSP
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval' https://xfwtjndfclckgvpvgiaj.supabase.co",
    "style-src 'self' 'unsafe-inline'", // Will be improved with nonces in production
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://xfwtjndfclckgvpvgiaj.supabase.co wss://xfwtjndfclckgvpvgiaj.supabase.co",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Enhanced function to apply security headers
export const applySecurityHeaders = (response: Response): Response => {
  const headers = new Headers(response.headers);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

// Enhanced CSRF protection
export const generateSecureCSRFToken = (): string => {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  
  // Extract timestamp to check token age (max 1 hour)
  const parts = expectedToken.split('-');
  if (parts.length !== 2) return false;
  
  const timestamp = parseInt(parts[1], 36);
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  if (now - timestamp > maxAge) return false;
  
  return token === expectedToken;
};

// Content validation for preventing XSS
export const sanitizeContent = (content: string): string => {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Security audit logging
export const logSecurityEvent = (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    details: JSON.stringify(details),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.warn('[SECURITY EVENT]', securityEvent);
  
  // In production, send to security monitoring service
  if (import.meta.env.PROD) {
    // Send to monitoring service
  }
};
