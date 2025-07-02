
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface PaymentData {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDesc: string;
}

interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

interface TransactionRecord {
  amount: number;
  description: string;
  type: string;
  status: string;
  reference?: string;
  user_id?: string;
}

export const useMpesaPayment = () => {
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

  const processPayment = useMutation({
    mutationFn: async (paymentData: PaymentData): Promise<PaymentResponse> => {
      try {
        setPaymentStatus('processing');
        
        // Record the transaction attempt
        const user = await supabase.auth.getUser();
        
        const transactionRecord: TransactionRecord = {
          amount: paymentData.amount,
          description: paymentData.transactionDesc,
          type: 'mpesa_payment',
          status: 'pending',
          reference: paymentData.accountReference,
          user_id: user.data.user?.id
        };

        const { data: transaction, error } = await supabase
          .from('credit_transactions')
          .insert([transactionRecord])
          .select()
          .single();

        if (error) throw error;

        // Simulate M-Pesa payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, assume success
        const paymentSuccess = Math.random() > 0.1; // 90% success rate

        if (paymentSuccess) {
          // Update transaction status
          await supabase
            .from('credit_transactions')
            .update({ status: 'completed' })
            .eq('id', transaction.id);

          setPaymentStatus('completed');

          return {
            success: true,
            transaction_id: transaction.id
          };
        } else {
          // Update transaction status to failed
          await supabase
            .from('credit_transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id);

          setPaymentStatus('failed');

          return {
            success: false,
            error: 'Payment failed. Please try again.'
          };
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failed');
        return {
          success: false,
          error: error.message || 'Payment processing failed'
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
        toast.success('Payment processed successfully!');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    },
    onError: (error: any) => {
      setPaymentStatus('failed');
      toast.error(`Payment failed: ${error.message}`);
    }
  });

  const initiatePayment = async (data: PaymentData) => {
    return processPayment.mutateAsync(data);
  };

  return {
    processPayment,
    initiatePayment,
    isLoading: processPayment.isPending,
    paymentStatus
  };
};
