
import React, { useState, useEffect } from 'react';
import { useMspaceAccounts } from '@/hooks/mspace/useMspaceAccounts';
import { toast } from 'sonner';
import { SubUsersHeader } from './subusers/SubUsersHeader';
import { SummaryCards } from './subusers/SummaryCards';
import { TopUpDialog } from './subusers/TopUpDialog';
import { UsersTable } from './subusers/UsersTable';
import { CredentialsError } from './subusers/CredentialsError';

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export function SubUsersManager() {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [resellerClients, setResellerClients] = useState<ResellerClient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topUpData, setTopUpData] = useState({ clientname: '', noOfSms: 0, type: 'subAccount' });
  const [credentialsError, setCredentialsError] = useState(false);
  
  const { 
    querySubAccounts, 
    queryResellerClients,
    topUpSubAccount,
    topUpResellerClient,
    isLoading 
  } = useMspaceAccounts();

  const loadSubUsers = async () => {
    try {
      setCredentialsError(false);
      const data = await querySubAccounts();
      setSubUsers(data);
    } catch (error: any) {
      console.error('Failed to load sub users:', error);
      if (error.message?.includes('credentials not configured')) {
        setCredentialsError(true);
      }
    }
  };

  const loadResellerClients = async () => {
    try {
      setCredentialsError(false);
      const data = await queryResellerClients();
      setResellerClients(data);
    } catch (error: any) {
      console.error('Failed to load reseller clients:', error);
      if (error.message?.includes('credentials not configured')) {
        setCredentialsError(true);
      }
    }
  };

  const handleTopUp = async () => {
    if (!topUpData.clientname || topUpData.noOfSms <= 0) {
      toast.error('Please enter valid client name and SMS quantity');
      return;
    }

    try {
      if (topUpData.type === 'subAccount') {
        await topUpSubAccount({
          clientname: topUpData.clientname,
          noOfSms: topUpData.noOfSms
        });
        await loadSubUsers();
      } else {
        await topUpResellerClient({
          clientname: topUpData.clientname,
          noOfSms: topUpData.noOfSms
        });
        await loadResellerClients();
      }
      
      setIsDialogOpen(false);
      setTopUpData({ clientname: '', noOfSms: 0, type: 'subAccount' });
    } catch (error) {
      console.error('Top-up failed:', error);
    }
  };

  const handleRefresh = () => {
    loadSubUsers();
    loadResellerClients();
  };

  const handleTopUpClick = (clientname?: string, type?: string) => {
    if (clientname && type) {
      setTopUpData({ clientname, noOfSms: 0, type });
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadSubUsers();
    loadResellerClients();
  }, []);

  if (credentialsError) {
    return <CredentialsError onRefresh={handleRefresh} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-6">
      <SubUsersHeader 
        onRefresh={handleRefresh}
        onTopUp={() => handleTopUpClick()}
        isLoading={isLoading}
      />

      <SummaryCards 
        subUsers={subUsers}
        resellerClients={resellerClients}
      />

      <UsersTable 
        subUsers={subUsers}
        resellerClients={resellerClients}
        isLoading={isLoading}
        onTopUp={handleTopUpClick}
      />

      <TopUpDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        topUpData={topUpData}
        setTopUpData={setTopUpData}
        onTopUp={handleTopUp}
        isLoading={isLoading}
      />
    </div>
  );
}
