
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, CreditCard, Calendar } from 'lucide-react';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  created_at: string;
  payment_method?: string;
  receipt_url?: string;
}

export function CreditHistory() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['credit-history'],
    queryFn: async (): Promise<CreditTransaction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Mock data for now - would come from actual transactions table
      return [
        {
          id: '1',
          amount: 100.00,
          type: 'purchase',
          description: 'Credit purchase via M-Pesa',
          created_at: '2024-01-15T10:30:00Z',
          payment_method: 'M-Pesa',
          receipt_url: '#'
        },
        {
          id: '2',
          amount: -5.50,
          type: 'usage',
          description: 'SMS Campaign: Marketing Blast',
          created_at: '2024-01-14T15:20:00Z'
        },
        {
          id: '3',
          amount: 50.00,
          type: 'purchase',
          description: 'Credit purchase via M-Pesa',
          created_at: '2024-01-10T09:15:00Z',
          payment_method: 'M-Pesa'
        }
      ];
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'usage': return 'bg-red-100 text-red-800';
      case 'refund': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'usage' ? '' : '+';
    return `${prefix}$${amount.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Credit History
            </CardTitle>
            <CardDescription>
              View all credit purchases, usage, and transactions
            </CardDescription>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.type === 'usage' ? 'text-red-600' : 'text-green-600'}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell>{transaction.payment_method || '-'}</TableCell>
                  <TableCell>
                    {transaction.receipt_url && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
