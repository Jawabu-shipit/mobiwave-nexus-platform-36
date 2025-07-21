
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CredentialsErrorProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function CredentialsError({ onRefresh, isLoading }: CredentialsErrorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Sub Users & Reseller Clients</h3>
        <p className="text-gray-600">Manage sub accounts and reseller client balances</p>
      </div>
      
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p className="font-medium">Mspace API credentials not configured</p>
            <p>To use this feature, you need to configure your Mspace API credentials first.</p>
            <div className="flex gap-2 mt-3">
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Link to="/admin/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Credentials
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
