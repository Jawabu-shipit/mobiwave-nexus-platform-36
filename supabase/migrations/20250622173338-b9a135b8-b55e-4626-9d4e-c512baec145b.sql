
-- Fix campaigns table status constraint and add missing statuses
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed', 'scheduled', 'processing'));

-- Create contact_groups table
CREATE TABLE IF NOT EXISTS contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_group_members junction table
CREATE TABLE IF NOT EXISTS contact_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, contact_id)
);

-- Create campaign_personalization table for message personalization
CREATE TABLE IF NOT EXISTS campaign_personalization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    field_mappings JSONB DEFAULT '{}',
    template_variables JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_rules table for advanced triggers
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL, -- 'time_based', 'event_based', 'condition_based'
    trigger_config JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_activation_requests table for enterprise features
CREATE TABLE IF NOT EXISTS service_activation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services_catalog(id) NOT NULL,
    requested_features JSONB DEFAULT '[]',
    business_justification TEXT,
    expected_usage TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
    admin_notes TEXT,
    approved_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_analytics table for tracking
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_activation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_groups
CREATE POLICY "Users can view their own contact groups" ON contact_groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact groups" ON contact_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact groups" ON contact_groups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact groups" ON contact_groups
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contact_group_members
CREATE POLICY "Users can view their group members" ON contact_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contact_groups 
            WHERE id = contact_group_members.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their group members" ON contact_group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contact_groups 
            WHERE id = contact_group_members.group_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for campaign_personalization
CREATE POLICY "Users can manage their campaign personalization" ON campaign_personalization
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_personalization.campaign_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for automation_rules
CREATE POLICY "Users can view their automation rules" ON automation_rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their automation rules" ON automation_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their automation rules" ON automation_rules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their automation rules" ON automation_rules
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for service_activation_requests
CREATE POLICY "Users can view their service requests" ON service_activation_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create service requests" ON service_activation_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests" ON service_activation_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create RLS policies for campaign_analytics
CREATE POLICY "Users can view their campaign analytics" ON campaign_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_analytics.campaign_id AND user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_groups_user_id ON contact_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_contact_id ON contact_group_members(contact_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_service_activation_requests_user_id ON service_activation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_activation_requests_status ON service_activation_requests(status);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);

-- Create function to update contact group count
CREATE OR REPLACE FUNCTION update_contact_group_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE contact_groups 
        SET contact_count = contact_count + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contact_groups 
        SET contact_count = contact_count - 1,
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contact group count
CREATE TRIGGER trigger_update_contact_group_count
    AFTER INSERT OR DELETE ON contact_group_members
    FOR EACH ROW EXECUTE FUNCTION update_contact_group_count();
