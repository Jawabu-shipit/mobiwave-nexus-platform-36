
import { supabase } from '@/integrations/supabase/client';

export interface AuditAction {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async logAction(
    userId: string,
    action: string,
    details: {
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: details.resourceType,
          resource_id: details.resourceId,
          metadata: details.metadata || {},
          severity: details.severity || 'low',
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          session_id: this.getSessionId()
        });

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Insert directly into security_events table instead of using RPC
      const { error } = await supabase
        .from('security_events')
        .insert({
          event_type: eventType,
          severity: severity,
          details: {
            ...details,
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default AuditLogger;
