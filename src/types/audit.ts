export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  ip_address?: unknown;
  user_agent?: string | null;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Message {
  id: string;
  type: 'sms' | 'email' | 'push';
  recipient: string;
  sender: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: Date;
  delivered_at?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
}
