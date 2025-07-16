import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

type ApiCredentialRow = Database['public']['Tables']['api_credentials']['Row'];
type AuditEntryRow = Database['public']['Tables']['api_credentials_audit']['Row'];

interface ApiCredential extends ApiCredentialRow {
  user_email?: string;
  role: string;
  onDelete?: (id: string) => void;
}

type AuditEntry = AuditEntryRow;

export function useAllApiCredentials() {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Join with users table to get email and role
      const { data, error } = await supabase
        .from('api_credentials')
        .select('id, user_id, api_key, service_name, is_active, expires_at, created_by, updated_by, profiles:profiles(email, role)')
        .order('user_id');
      if (error) throw error;
      setCredentials(
        (data || []).map((row: any) => ({
          ...row,
          user_email: row.profiles?.email,
          role: row.profiles?.role || 'user',
          onDelete: handleDelete,
        }))
      );

      // Fetch audit history
      const { data: auditData, error: auditError } = await (supabase as any)
        .from('api_credentials_audit')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!auditError && auditData) {
        setAuditHistory(auditData as AuditEntry[]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch API credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, actorId?: string, actorEmail?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('api_credentials').delete().eq('id', id);
      if (error) throw error;
      // Audit log
      await (supabase as any).from('api_credentials_audit').insert({
        credential_id: id,
        action: 'delete',
        actor_id: actorId ?? null,
        actor_email: actorEmail ?? null,
        timestamp: new Date().toISOString(),
        details: {},
      });
      await fetchCredentials();
    } catch (e: any) {
      setError(e.message || 'Failed to delete API credential');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredential = async (id: string, updates: Partial<ApiCredentialRow>, actorId?: string, actorEmail?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('api_credentials').update(updates).eq('id', id);
      if (error) throw error;
      // Audit log
      await (supabase as any).from('api_credentials_audit').insert({
        credential_id: id,
        action: 'edit',
        actor_id: actorId ?? null,
        actor_email: actorEmail ?? null,
        timestamp: new Date().toISOString(),
        details: updates,
      });
      await fetchCredentials();
    } catch (e: any) {
      setError(e.message || 'Failed to update API credential');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    credentials,
    isLoading,
    error,
    refresh: fetchCredentials,
    auditHistory,
    updateCredential,
    deleteCredential: handleDelete,
  };
}
