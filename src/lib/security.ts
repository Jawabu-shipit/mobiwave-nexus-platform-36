
import { supabase } from '@/integrations/supabase/client';

export interface SecurityConfig {
  enableRateLimit: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  sessionTimeout: number;
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig = {
    enableRateLimit: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    sessionTimeout: 3600000 // 1 hour
  };

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert directly into security_events table
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user?.id,
          event_type: eventType,
          severity: severity,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  sanitizeInput(input: string): string {
    if (!this.config.enableXSSProtection) return input;
    
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  validateTLSConfig(): boolean {
    // Check if the current connection is using HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    
    // For localhost development, we consider it valid
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    return isHTTPS || isLocalhost;
  }

  validateSession(): boolean {
    try {
      const sessionStart = sessionStorage.getItem('session_start');
      if (!sessionStart) return false;

      const elapsed = Date.now() - parseInt(sessionStart);
      return elapsed < this.config.sessionTimeout;
    } catch (error) {
      return false;
    }
  }

  initializeSession(): void {
    sessionStorage.setItem('session_start', Date.now().toString());
  }

  clearSession(): void {
    sessionStorage.removeItem('session_start');
    sessionStorage.removeItem('csrf_token');
  }

  generateCSRFToken(): string {
    if (!this.config.enableCSRFProtection) return '';
    
    const token = Math.random().toString(36).substr(2, 15);
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true;
    
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  }

  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  detectSuspiciousActivity(): boolean {
    const suspiciousPatterns = [
      'bot', 'crawler', 'spider', 'scraper',
      'hack', 'exploit', 'injection'
    ];
    
    const userAgent = navigator.userAgent.toLowerCase();
    return suspiciousPatterns.some(pattern => userAgent.includes(pattern));
  }

  enforceRateLimit(key: string, limit: number = 100): boolean {
    if (!this.config.enableRateLimit) return true;
    
    const rateLimitKey = `rate_limit_${key}`;
    const current = sessionStorage.getItem(rateLimitKey);
    const now = Date.now();
    
    if (!current) {
      sessionStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, resetTime: now + 60000 }));
      return true;
    }
    
    const data = JSON.parse(current);
    
    if (now > data.resetTime) {
      sessionStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, resetTime: now + 60000 }));
      return true;
    }
    
    if (data.count >= limit) {
      this.logSecurityEvent('rate_limit_exceeded', 'medium', { key, limit });
      return false;
    }
    
    data.count++;
    sessionStorage.setItem(rateLimitKey, JSON.stringify(data));
    return true;
  }
}

export default SecurityManager;
