
import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'low' | 'medium' | 'high' | 'critical';

export const useAuditLogger = () => {
  const logUserAction = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: any,
    severity: LogLevel = 'low'
  ) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.data.user?.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: metadata || {},
          severity: severity,
          status: 'success'
        });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  const logSystemEvent = async (
    eventType: string,
    component: string,
    action: string,
    metadata?: any,
    severity: LogLevel = 'medium'
  ) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_audit_logs')
        .insert({
          user_id: user.data.user?.id,
          event_type: eventType,
          component,
          action,
          metadata: metadata || {},
          severity: severity,
          status: 'success'
        });

      if (error) {
        console.error('Failed to log system audit event:', error);
      }
    } catch (error) {
      console.error('Failed to log system audit event:', error);
    }
  };

  const logSecurityEvent = async (
    eventType: string,
    severity: LogLevel = 'medium',
    metadata?: any
  ) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user.data.user?.id,
          event_type: eventType,
          severity: severity,
          details: metadata || {}
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return {
    logUserAction,
    logSystemEvent,
    logSecurityEvent
  };
};
