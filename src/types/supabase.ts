export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          client_id: string
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          os: string | null
          properties: Json | null
          referrer: string | null
          revenue: number | null
          service_type: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          os?: string | null
          properties?: Json | null
          referrer?: string | null
          revenue?: number | null
          service_type?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          os?: string | null
          properties?: Json | null
          referrer?: string | null
          revenue?: number | null
          service_type?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      api_credentials: {
        Row: {
          api_key: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          service_name: string
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          api_key?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          service_name: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          username?: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          service_name?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      api_credentials_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          credential_id: string | null
          details: Json | null
          id: string
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          credential_id?: string | null
          details?: Json | null
          id?: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          credential_id?: string | null
          details?: Json | null
          id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_credentials_audit_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "api_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          severity: string | null
          status: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          bounce_rate: number | null
          campaign_id: string
          clicked_count: number | null
          conversion_count: number | null
          engagement_rate: number | null
          id: string
          opened_count: number | null
          revenue_generated: number | null
          tracked_at: string | null
        }
        Insert: {
          bounce_rate?: number | null
          campaign_id: string
          clicked_count?: number | null
          conversion_count?: number | null
          engagement_rate?: number | null
          id?: string
          opened_count?: number | null
          revenue_generated?: number | null
          tracked_at?: string | null
        }
        Update: {
          bounce_rate?: number | null
          campaign_id?: string
          clicked_count?: number | null
          conversion_count?: number | null
          engagement_rate?: number | null
          id?: string
          opened_count?: number | null
          revenue_generated?: number | null
          tracked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_personalization: {
        Row: {
          campaign_id: string
          created_at: string | null
          field_mappings: Json | null
          id: string
          template_variables: Json | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          template_variables?: Json | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          template_variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_personalization_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_triggers: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          trigger_condition: Json | null
          trigger_type: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          trigger_condition?: Json | null
          trigger_type: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          trigger_condition?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_triggers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          content: string | null
          cost: number | null
          created_at: string | null
          data_model_id: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message: string
          metadata: Json | null
          name: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string | null
          target_criteria: Json | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          cost?: number | null
          created_at?: string | null
          data_model_id?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message: string
          metadata?: Json | null
          name: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_criteria?: Json | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          cost?: number | null
          created_at?: string | null
          data_model_id?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message?: string
          metadata?: Json | null
          name?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_criteria?: Json | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_data_model_id_fkey"
            columns: ["data_model_id"]
            isOneToOne: false
            referencedRelation: "data_models"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          plan_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_group_members: {
        Row: {
          added_at: string | null
          contact_id: string
          group_id: string
          id: string
        }
        Insert: {
          added_at?: string | null
          contact_id: string
          group_id: string
          id?: string
        }
        Update: {
          added_at?: string | null
          contact_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contact_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_groups: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_models: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          error_code: string | null
          error_message: string
          error_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          stack_trace: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_code?: string | null
          error_message: string
          error_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack_trace?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_code?: string | null
          error_message?: string
          error_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack_trace?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      import_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          failed_reason: string | null
          file_type: string
          file_url: string
          id: string
          model_id: string
          processed_records: number | null
          retries: number | null
          status: string
          total_records: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          failed_reason?: string | null
          file_type: string
          file_url: string
          id?: string
          model_id: string
          processed_records?: number | null
          retries?: number | null
          status?: string
          total_records?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          failed_reason?: string | null
          file_type?: string
          file_url?: string
          id?: string
          model_id?: string
          processed_records?: number | null
          retries?: number | null
          status?: string
          total_records?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "data_models"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          issued_date: string
          paid_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issued_date: string
          paid_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issued_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      message_history: {
        Row: {
          campaign_id: string | null
          content: string
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_message_id: string | null
          recipient: string
          retry_count: number | null
          sender: string
          sent_at: string | null
          status: string | null
          subject: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          content: string
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          recipient: string
          retry_count?: number | null
          sender: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          recipient?: string
          retry_count?: number | null
          sender?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_transactions: {
        Row: {
          account_reference: string | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          mpesa_receipt_number: string | null
          phone_number: string
          status: string | null
          transaction_desc: string | null
          transaction_id: string
          transaction_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_reference?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          phone_number: string
          status?: string | null
          transaction_desc?: string | null
          transaction_id: string
          transaction_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_reference?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          phone_number?: string
          status?: string | null
          transaction_desc?: string | null
          transaction_id?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mspace_pesa_integrations: {
        Row: {
          callback_url: string
          consumer_key: string | null
          consumer_secret: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          passkey: string | null
          shortcode: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          callback_url: string
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          passkey?: string | null
          shortcode?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          callback_url?: string
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          passkey?: string | null
          shortcode?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mspace_ussd_applications: {
        Row: {
          callback_url: string
          created_at: string | null
          id: string
          menu_structure: Json | null
          service_code: string
          status: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          callback_url: string
          created_at?: string | null
          id?: string
          menu_structure?: Json | null
          service_code: string
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          callback_url?: string
          created_at?: string | null
          id?: string
          menu_structure?: Json | null
          service_code?: string
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mspace_ussd_applications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_service_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_notifications: boolean | null
          notification_types: Json | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          notification_types?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          notification_types?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string
          read_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          tags: Json | null
          timestamp: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          tags?: Json | null
          timestamp?: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          tags?: Json | null
          timestamp?: string
          unit?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      plan_service_access: {
        Row: {
          created_at: string | null
          id: string
          is_included: boolean | null
          plan_id: string | null
          requires_approval: boolean | null
          service_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          plan_id?: string | null
          requires_approval?: boolean | null
          service_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          plan_id?: string | null
          requires_approval?: boolean | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_service_access_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          failed_login_attempts: number | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          locked_until: string | null
          password_changed_at: string | null
          phone: string | null
          role: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          phone?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          phone?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      realtime_connections: {
        Row: {
          channel: string
          connection_id: string
          created_at: string
          id: string
          last_ping: string | null
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel: string
          connection_id: string
          created_at?: string
          id?: string
          last_ping?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          connection_id?: string
          created_at?: string
          id?: string
          last_ping?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      realtime_events: {
        Row: {
          channel: string
          created_at: string
          data: Json | null
          event_type: string
          id: string
          metadata: Json | null
          priority: string
          service_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          metadata?: Json | null
          priority?: string
          service_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          metadata?: Json | null
          priority?: string
          service_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      records: {
        Row: {
          created_at: string
          data: Json
          id: string
          model_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          model_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          model_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "data_models"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          permissions: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_campaigns: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          scheduled_for: string
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          scheduled_for: string
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          scheduled_for?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_rewards: {
        Row: {
          agent_id: string
          amount: number
          client_id: string
          created_at: string | null
          custom_interval: number | null
          day_of_month: number | null
          days_of_week: number[] | null
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          last_run_at: string | null
          name: string
          network: string | null
          next_run_at: string | null
          phone_number: string
          start_date: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          client_id: string
          created_at?: string | null
          custom_interval?: number | null
          day_of_month?: number | null
          days_of_week?: number[] | null
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          last_run_at?: string | null
          name: string
          network?: string | null
          next_run_at?: string | null
          phone_number: string
          start_date: string
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          client_id?: string
          created_at?: string | null
          custom_interval?: number | null
          day_of_month?: number | null
          days_of_week?: number[] | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          last_run_at?: string | null
          name?: string
          network?: string | null
          next_run_at?: string | null
          phone_number?: string
          start_date?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_rewards_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_rewards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_activation_requests: {
        Row: {
          admin_notes: string | null
          approved_by: string | null
          business_justification: string | null
          created_at: string | null
          expected_usage: string | null
          id: string
          priority: string | null
          processed_at: string | null
          requested_features: Json | null
          service_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_by?: string | null
          business_justification?: string | null
          created_at?: string | null
          expected_usage?: string | null
          id?: string
          priority?: string | null
          processed_at?: string | null
          requested_features?: Json | null
          service_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_by?: string | null
          business_justification?: string | null
          created_at?: string | null
          expected_usage?: string | null
          id?: string
          priority?: string | null
          processed_at?: string | null
          requested_features?: Json | null
          service_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_activation_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      service_desk_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string
          customer_email: string | null
          customer_phone: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          sla_due_at: string | null
          status: string | null
          subscription_id: string | null
          ticket_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          customer_email?: string | null
          customer_phone?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string | null
          subscription_id?: string | null
          ticket_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          customer_email?: string | null
          customer_phone?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string | null
          subscription_id?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_desk_tickets_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_service_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      services_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          monthly_fee: number | null
          provider: string | null
          service_name: string
          service_type: string
          setup_fee: number | null
          transaction_fee_amount: number | null
          transaction_fee_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          monthly_fee?: number | null
          provider?: string | null
          service_name: string
          service_type: string
          setup_fee?: number | null
          transaction_fee_amount?: number | null
          transaction_fee_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          monthly_fee?: number | null
          provider?: string | null
          service_name?: string
          service_type?: string
          setup_fee?: number | null
          transaction_fee_amount?: number | null
          transaction_fee_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      sub_users: {
        Row: {
          created_at: string
          credits_allocated: number | null
          credits_used: number | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          parent_user_id: string
          permissions: Json | null
          role: string
          service_access: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_allocated?: number | null
          credits_used?: number | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          parent_user_id: string
          permissions?: Json | null
          role?: string
          service_access?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_allocated?: number | null
          credits_used?: number | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          parent_user_id?: string
          permissions?: Json | null
          role?: string
          service_access?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          service_limits: Json | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          service_limits?: Json | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          service_limits?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_audit_logs: {
        Row: {
          action: string
          component: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          severity: string | null
          status: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          component?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          status?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          component?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          status?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          active_connections: number | null
          cpu_usage: number | null
          created_at: string
          disk_usage: number | null
          error_rate: number | null
          id: string
          memory_usage: number | null
          metadata: Json | null
          response_time: number | null
          service_name: string
          status: string
          timestamp: string
        }
        Insert: {
          active_connections?: number | null
          cpu_usage?: number | null
          created_at?: string
          disk_usage?: number | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          response_time?: number | null
          service_name: string
          status: string
          timestamp?: string
        }
        Update: {
          active_connections?: number | null
          cpu_usage?: number | null
          created_at?: string
          disk_usage?: number | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          response_time?: number | null
          service_name?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      ticket_activities: {
        Row: {
          activity_type: string
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_desk_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_id: string | null
          amount: number
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          network: string | null
          phone_number: string
          reference: string | null
          scheduled_reward_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          network?: string | null
          phone_number: string
          reference?: string | null
          scheduled_reward_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          network?: string | null
          phone_number?: string
          reference?: string | null
          scheduled_reward_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_scheduled_reward_id_fkey"
            columns: ["scheduled_reward_id"]
            isOneToOne: false
            referencedRelation: "scheduled_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number | null
          created_at: string | null
          credits_purchased: number | null
          credits_remaining: number | null
          id: string
          last_transaction_at: string | null
          total_purchased: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          credits_purchased?: number | null
          credits_remaining?: number | null
          id?: string
          last_transaction_at?: string | null
          total_purchased?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          credits_purchased?: number | null
          credits_remaining?: number | null
          id?: string
          last_transaction_at?: string | null
          total_purchased?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_credits_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          plan_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          expires_at: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_service_subscriptions: {
        Row: {
          activated_at: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          monthly_billing_active: boolean | null
          service_id: string | null
          setup_fee_paid: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          monthly_billing_active?: boolean | null
          service_id?: string | null
          setup_fee_paid?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          monthly_billing_active?: boolean | null
          service_id?: string | null
          setup_fee_paid?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_service_subscriptions_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_service_subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_save: boolean | null
          created_at: string
          dashboard_layout: Json | null
          id: string
          language: string | null
          session_timeout: number | null
          theme: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save?: boolean | null
          created_at?: string
          dashboard_layout?: Json | null
          id?: string
          language?: string | null
          session_timeout?: number | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save?: boolean | null
          created_at?: string
          dashboard_layout?: Json | null
          id?: string
          language?: string | null
          session_timeout?: number | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ussd_sessions: {
        Row: {
          application_id: string | null
          created_at: string | null
          current_node_id: string | null
          id: string
          input_path: string[] | null
          navigation_path: string[] | null
          phone_number: string
          session_data: Json | null
          session_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          current_node_id?: string | null
          id?: string
          input_path?: string[] | null
          navigation_path?: string[] | null
          phone_number: string
          session_data?: Json | null
          session_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          current_node_id?: string | null
          id?: string
          input_path?: string[] | null
          navigation_path?: string[] | null
          phone_number?: string
          session_data?: Json | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ussd_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mspace_ussd_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          content: string
          created_at: string | null
          delivered_at: string | null
          failed_reason: string | null
          id: string
          message_type: string
          read_at: string | null
          recipient_phone: string
          sent_at: string | null
          status: string | null
          subscription_id: string | null
          template_name: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          template_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string | null
          subscription_id?: string | null
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_subscriptions: {
        Row: {
          access_token_encrypted: string
          business_account_id: string
          created_at: string | null
          current_messages: number | null
          id: string
          message_limit: number | null
          phone_number_id: string
          status: string | null
          subscription_id: string | null
          verify_token: string
          webhook_url: string
        }
        Insert: {
          access_token_encrypted: string
          business_account_id: string
          created_at?: string | null
          current_messages?: number | null
          id?: string
          message_limit?: number | null
          phone_number_id: string
          status?: string | null
          subscription_id?: string | null
          verify_token: string
          webhook_url: string
        }
        Update: {
          access_token_encrypted?: string
          business_account_id?: string
          created_at?: string | null
          current_messages?: number | null
          id?: string
          message_limit?: number | null
          phone_number_id?: string
          status?: string | null
          subscription_id?: string | null
          verify_token?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_service_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body_text: string
          buttons: Json | null
          category: string
          created_at: string | null
          footer_text: string | null
          header_text: string | null
          header_type: string | null
          id: string
          language: string
          name: string
          status: string | null
          subscription_id: string | null
          variables: Json | null
          whatsapp_template_id: string | null
        }
        Insert: {
          body_text: string
          buttons?: Json | null
          category: string
          created_at?: string | null
          footer_text?: string | null
          header_text?: string | null
          header_type?: string | null
          id?: string
          language?: string
          name: string
          status?: string | null
          subscription_id?: string | null
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Update: {
          body_text?: string
          buttons?: Json | null
          category?: string
          created_at?: string | null
          footer_text?: string | null
          header_text?: string | null
          header_type?: string | null
          id?: string
          language?: string
          name?: string
          status?: string | null
          subscription_id?: string | null
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          trigger_data: Json | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_connection_ping: {
        Args: { connection_id_param: string }
        Returns: undefined
      }
      user_has_service_access: {
        Args: { user_uuid: string; service_type_name: string }
        Returns: boolean
      }
      validate_kenyan_phone: {
        Args: { phone_input: string }
        Returns: string
      }
    }
    Enums: {
      user_role: "user" | "manager" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "manager", "admin", "super_admin"],
    },
  },
} as const
