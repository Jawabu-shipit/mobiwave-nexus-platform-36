
-- Add missing columns to existing tables
ALTER TABLE public.user_service_subscriptions 
ADD COLUMN IF NOT EXISTS configuration JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'demo';

-- Update user_credits table to match expected interface
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS credits_remaining NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_purchased NUMERIC DEFAULT 0;

-- Update credits_remaining and credits_purchased based on existing data
UPDATE public.user_credits 
SET credits_remaining = balance,
    credits_purchased = total_purchased
WHERE credits_remaining IS NULL OR credits_purchased IS NULL;
