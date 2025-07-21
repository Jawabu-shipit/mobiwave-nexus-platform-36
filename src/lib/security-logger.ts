
// Secure logging that removes sensitive information in production
export class SecurityLogger {
  private static instance: SecurityLogger;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  // Safe logging that removes sensitive data in production
  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data);
    } else {
      // In production, log only non-sensitive information
      const sanitizedData = this.sanitizeLogData(data);
      console.log(`[INFO] ${message}`, sanitizedData);
    }
  }

  warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      const sanitizedData = this.sanitizeLogData(data);
      console.warn(`[WARN] ${message}`, sanitizedData);
    }
  }

  error(message: string, error?: any) {
    // Always log errors, but sanitize sensitive data
    const sanitizedError = this.sanitizeLogData(error);
    console.error(`[ERROR] ${message}`, sanitizedError);
  }

  private sanitizeLogData(data: any): any {
    if (!data) return data;
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'api_key', 'api_secret', 'token', 'jwt',
      'credit_card', 'ssn', 'phone', 'email', 'address'
    ];

    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeLogData(sanitized[key]);
        }
      });
      
      return sanitized;
    }
    
    return data;
  }
}

// Global secure logger instance
export const secureLogger = SecurityLogger.getInstance();
