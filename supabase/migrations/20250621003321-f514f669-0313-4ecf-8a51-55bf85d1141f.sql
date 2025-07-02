
-- Create workflow automation tables
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'time_based', 'event_based', 'manual'
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  trigger_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign triggers table
CREATE TABLE IF NOT EXISTS campaign_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  trigger_type VARCHAR(50) NOT NULL,
  trigger_condition JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create service desk tickets table (making it functional)
CREATE TABLE IF NOT EXISTS service_desk_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'pending', 'resolved', 'closed'
  assigned_to UUID,
  created_by UUID NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  sla_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket activities table
CREATE TABLE IF NOT EXISTS ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES service_desk_tickets(id),
  user_id UUID NOT NULL,
  activity_type VARCHAR(20) NOT NULL, -- 'comment', 'status_change', 'assignment', 'priority_change'
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create scheduled campaigns queue table
CREATE TABLE IF NOT EXISTS scheduled_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_desk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_campaigns ENABLE ROW LEVEL SECURITY;

-- Workflows policies
CREATE POLICY "Users can manage their workflows" ON workflows
  FOR ALL USING (auth.uid() = user_id);

-- Workflow executions policies
CREATE POLICY "Users can view their workflow executions" ON workflow_executions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_executions.workflow_id AND workflows.user_id = auth.uid())
  );

-- Campaign triggers policies
CREATE POLICY "Users can manage their campaign triggers" ON campaign_triggers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_triggers.campaign_id AND campaigns.user_id = auth.uid())
  );

-- Service desk tickets policies
CREATE POLICY "Users can view tickets for their subscriptions" ON service_desk_tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = service_desk_tickets.subscription_id AND uss.user_id = auth.uid())
  );

CREATE POLICY "Users can create tickets for their subscriptions" ON service_desk_tickets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = service_desk_tickets.subscription_id AND uss.user_id = auth.uid())
  );

CREATE POLICY "Users can update tickets for their subscriptions" ON service_desk_tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = service_desk_tickets.subscription_id AND uss.user_id = auth.uid())
  );

-- Ticket activities policies
CREATE POLICY "Users can view ticket activities" ON ticket_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_desk_tickets sdt
      JOIN user_service_subscriptions uss ON uss.id = sdt.subscription_id
      WHERE sdt.id = ticket_activities.ticket_id AND uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add ticket activities" ON ticket_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_desk_tickets sdt
      JOIN user_service_subscriptions uss ON uss.id = sdt.subscription_id
      WHERE sdt.id = ticket_activities.ticket_id AND uss.user_id = auth.uid()
    )
  );

-- Scheduled campaigns policies
CREATE POLICY "Users can manage their scheduled campaigns" ON scheduled_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = scheduled_campaigns.campaign_id AND campaigns.user_id = auth.uid())
  );

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TICK-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Create trigger for automatic ticket number generation
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON service_desk_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();
