
-- Create mpesa_transactions table
CREATE TABLE public.mpesa_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.mspace_pesa_integrations(id),
  amount NUMERIC NOT NULL,
  phone_number VARCHAR NOT NULL,
  mpesa_receipt_number VARCHAR,
  transaction_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR NOT NULL DEFAULT 'pending',
  reference VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their integration transactions" 
  ON public.mpesa_transactions 
  FOR SELECT 
  USING (
    integration_id IN (
      SELECT mpi.id 
      FROM public.mspace_pesa_integrations mpi
      JOIN public.user_service_subscriptions uss ON uss.id = mpi.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their integration transactions" 
  ON public.mpesa_transactions 
  FOR INSERT 
  WITH CHECK (
    integration_id IN (
      SELECT mpi.id 
      FROM public.mspace_pesa_integrations mpi
      JOIN public.user_service_subscriptions uss ON uss.id = mpi.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );
