
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Activity, Layers, Zap } from 'lucide-react';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useMspaceApi } from '@/hooks/useMspaceApi';
import { useActiveOperations } from '@/hooks/useActiveOperations';

export function StatusCards() {
  const { data: credits } = useUserCredits();
  const { checkBalance } = useMspaceApi();
  const { activeCount, runningCount } = useActiveOperations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Your Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              ${credits?.credits_remaining?.toFixed(2) || '0.00'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Available balance</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Mspace Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            {checkBalance.data ? (
              <span className="text-2xl font-bold text-purple-600">
                {checkBalance.data.currency} {checkBalance.data.balance}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Provider balance</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{activeCount}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {runningCount > 0 ? `${runningCount} running, ${activeCount - runningCount} queued` : 'No active operations'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              Optimized
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">All systems optimal</p>
        </CardContent>
      </Card>
    </div>
  );
}
