
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLoginSecurity() {
  const logSecurityEvent = async (eventType: string, severity: string = 'medium', details: any = {}) => {
    try {
      // Try to log to security_events table
      const { error: securityError } = await supabase
        .from('security_events')
        .insert({
          event_type: eventType,
          severity: severity as 'low' | 'medium' | 'high' | 'critical',
          details: details,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (securityError) {
        console.warn('Failed to log to security_events, trying audit_logs:', securityError);
        
        // Fallback to audit_logs
        const { error: auditError } = await supabase
          .from('audit_logs')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: eventType,
            resource_type: 'security',
            metadata: details,
            severity: severity as 'low' | 'medium' | 'high' | 'critical'
          });

        if (auditError) {
          console.error('Failed to log security event to audit_logs:', auditError);
        }
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return { logSecurityEvent };
}
