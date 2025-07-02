
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle,
  RefreshCw,
  Plus,
  History
} from 'lucide-react';
import { useMspaceAccounts } from '@/hooks/mspace/useMspaceAccounts';
import { useMspaceBalance } from '@/hooks/mspace/useMspaceBalance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'topup' | 'deduction';
  amount: number;
  recipient: string;
  description: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export function MspaceCreditsManager() {
  const [resellerTopupAmount, setResellerTopupAmount] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clientTopupAmount, setClientTopupAmount] = useState('');
  
  const queryClient = useQueryClient();
  const { 
    querySubAccounts, 
    queryResellerClients, 
    topUpSubAccount, 
    topUpResellerClient,
    isLoading: accountsLoading 
  } = useMspaceAccounts();
  
  const { checkBalance, isLoading: balanceLoading } = useMspaceBalance();

  // Fetch our reseller balance from Mspace
  const { data: resellerBalance, isLoading: resellerBalanceLoading } = useQuery({
    queryKey: ['mspace-reseller-balance'],
    queryFn: checkBalance,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch our reseller clients (Mobiwave's clients)
  const { data: resellerClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['mspace-reseller-clients'],
    queryFn: queryResellerClients,
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch credit transactions history
  const { data: transactions } = useQuery({
    queryKey: ['credit-transactions'],
    queryFn: async (): Promise<CreditTransaction[]> => {
      // This would fetch from a transactions table
      // For now, returning mock data
      return [
        {
          id: '1',
          type: 'purchase',
          amount: 10000,
          recipient: 'Mobiwave',
          description: 'Initial credit purchase from Mspace',
          created_at: new Date().toISOString(),
          status: 'completed'
        }
      ];
    }
  });

  // Purchase credits from Mspace (as reseller)
  const purchaseFromMspace = useMutation({
    mutationFn: async (amount: number) => {
      // This would integrate with Mspace's credit purchase API
      // For now, simulating the purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update our internal reseller balance
      const { error } = await supabase
        .from('user_credits')
        .update({ 
          credits_remaining: (resellerBalance?.balance || 0) + amount,
          credits_purchased: (resellerBalance?.balance || 0) + amount
        })
        .eq('user_id', 'reseller-account');
        
      if (error) throw error;
      return { success: true, amount };
    },
    onSuccess: (data) => {
      toast.success(`Successfully purchased ${data.amount} SMS credits from Mspace`);
      queryClient.invalidateQueries({ queryKey: ['mspace-reseller-balance'] });
      setResellerTopupAmount('');
    },
    onError: (error: any) => {
      toast.error(`Failed to purchase credits: ${error.message}`);
    }
  });

  // Top up a reseller client
  const topupClient = useMutation({
    mutationFn: async ({ clientname, amount }: { clientname: string; amount: number }) => {
      // Check if we have enough balance
      if (!resellerBalance || resellerBalance.balance < amount) {
        throw new Error('Insufficient reseller balance');
      }
      
      // Top up the client using Mspace API
      const result = await topUpResellerClient({ clientname, noOfSms: amount });
      
      // Deduct from our reseller balance
      await supabase
        .from('user_credits')
        .update({ 
          credits_remaining: resellerBalance.balance - amount
        })
        .eq('user_id', 'reseller-account');
        
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully topped up ${variables.amount} SMS credits for ${variables.clientname}`);
      queryClient.invalidateQueries({ queryKey: ['mspace-reseller-balance'] });
      queryClient.invalidateQueries({ queryKey: ['mspace-reseller-clients'] });
      setSelectedClient('');
      setClientTopupAmount('');
    },
    onError: (error: any) => {
      toast.error(`Failed to top up client: ${error.message}`);
    }
  });

  const handlePurchaseFromMspace = () => {
    const amount = parseInt(resellerTopupAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    purchaseFromMspace.mutate(amount);
  };

  const handleTopupClient = () => {
    const amount = parseInt(clientTopupAmount);
    if (!selectedClient || !amount || amount <= 0) {
      toast.error('Please select a client and enter a valid amount');
      return;
    }
    topupClient.mutate({ clientname: selectedClient, amount });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Mspace Credits Management</h3>
          <p className="text-gray-600">Manage SMS credits flow: Mspace → Mobiwave → Clients</p>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Mobiwave Balance (Reseller)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resellerBalanceLoading ? 'Loading...' : `${resellerBalance?.balance || 0} SMS`}
            </div>
            <p className="text-xs text-gray-500">Available to distribute</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsLoading ? 'Loading...' : resellerClients?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Reseller clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-purple-600" />
              Total Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resellerClients?.reduce((sum, client) => sum + parseInt(client.balance), 0) || 0} SMS
            </div>
            <p className="text-xs text-gray-500">To all clients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Purchase from Mspace</TabsTrigger>
          <TabsTrigger value="distribute">Distribute to Clients</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5" />
                Purchase Credits from Mspace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">SMS Credits Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter SMS count"
                    value={resellerTopupAmount}
                    onChange={(e) => setResellerTopupAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    KES {(parseInt(resellerTopupAmount) * 0.5 || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handlePurchaseFromMspace}
                disabled={purchaseFromMspace.isPending || !resellerTopupAmount}
                className="w-full"
              >
                {purchaseFromMspace.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Purchase {resellerTopupAmount} SMS Credits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5" />
                Distribute Credits to Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client</Label>
                  <select 
                    id="client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a client...</option>
                    {resellerClients?.map((client) => (
                      <option key={client.clientname} value={client.clientname}>
                        {client.clientname} (Balance: {client.balance} SMS)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAmount">SMS Credits Amount</Label>
                  <Input
                    id="clientAmount"
                    type="number"
                    placeholder="Enter SMS count"
                    value={clientTopupAmount}
                    onChange={(e) => setClientTopupAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Available Balance</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {resellerBalance?.balance || 0} SMS
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleTopupClient}
                disabled={topupClient.isPending || !selectedClient || !clientTopupAmount}
                className="w-full"
              >
                {topupClient.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                )}
                Top Up Client with {clientTopupAmount} SMS Credits
              </Button>
            </CardContent>
          </Card>

          {/* Client Balances Table */}
          <Card>
            <CardHeader>
              <CardTitle>Client Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resellerClients?.map((client) => (
                    <TableRow key={client.clientname}>
                      <TableCell className="font-medium">{client.clientname}</TableCell>
                      <TableCell>{client.balance} SMS</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedClient(client.clientname)}
                        >
                          Top Up
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant={
                          transaction.type === 'purchase' ? 'default' :
                          transaction.type === 'topup' ? 'secondary' : 'destructive'
                        }>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.amount} SMS</TableCell>
                      <TableCell>{transaction.recipient}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
