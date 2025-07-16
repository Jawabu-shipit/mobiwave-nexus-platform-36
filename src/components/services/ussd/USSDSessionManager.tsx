import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search, Clock, Users, TrendingUp } from 'lucide-react';
import { USSDSession, MenuNode } from './types';

interface USSDSessionManagerProps {
  applicationId?: string;
}

export function USSDSessionManager({ applicationId }: USSDSessionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['ussd-sessions', applicationId, dateRange],
    queryFn: async (): Promise<USSDSession[]> => {
      let query = supabase
        .from('ussd_sessions')
        .select(`
          *,
          application:mspace_ussd_applications(service_code, menu_structure)
        `)
        .order('created_at', { ascending: false });

      if (applicationId) {
        query = query.eq('application_id', applicationId);
      }

      const now = new Date();
      const daysAgo = parseInt(dateRange.replace('d', ''));
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;
      
      // Type cast the database response to our custom interface
      return (data || []).map(session => ({
        ...session,
        application: session.application ? {
          service_code: session.application.service_code,
          menu_structure: Array.isArray(session.application.menu_structure) 
            ? session.application.menu_structure as unknown as MenuNode[]
            : []
        } : undefined
      })) as USSDSession[];
    }
  });

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.phone_number.includes(searchTerm) ||
      session.session_id.includes(searchTerm) ||
      session.application?.service_code?.includes(searchTerm);

    return matchesSearch;
  });

  const sessionStats = {
    total: sessions.length,
    uniqueUsers: new Set(sessions.map(s => s.phone_number)).size,
    avgSessionLength: sessions.reduce((acc, s) => acc + s.input_path.length, 0) / (sessions.length || 1),
    completionRate: sessions.filter(s => {
      const app = s.application;
      if (!app) return false;
      const endNode = app.menu_structure?.find((node: MenuNode) => 
        node.id === s.current_node_id && node.isEndNode
      );
      return !!endNode;
    }).length / (sessions.length || 1) * 100
  };

  const getNodeText = (session: USSDSession, nodeId: string) => {
    const app = session.application;
    const node = app?.menu_structure?.find((n: MenuNode) => n.id === nodeId);
    return node ? node.text : nodeId;
  };

  const formatSessionPath = (session: USSDSession) => {
    return session.navigation_path.map((nodeId, index) => (
      <span key={index} className="text-xs">
        {index > 0 && ' → '}
        <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
          {getNodeText(session, nodeId).substring(0, 20)}...
        </span>
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">USSD Sessions</h2>
          <p className="text-gray-600">
            Monitor and analyze USSD session activity
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{sessionStats.total}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold">{sessionStats.uniqueUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Session Length</p>
                <p className="text-2xl font-bold">{sessionStats.avgSessionLength.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{sessionStats.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by phone number, session ID, or service code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
              <p className="text-gray-600">
                No USSD sessions match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {session.application?.service_code || 'Unknown'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {session.phone_number}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Navigation Path:</p>
                      <div className="flex flex-wrap gap-1">
                        {formatSessionPath(session)}
                      </div>
                    </div>

                    {session.input_path.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">User Inputs:</p>
                        <div className="flex gap-1">
                          {session.input_path.map((input, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {input}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <Badge 
                      variant={
                        session.application?.menu_structure?.find((node: MenuNode) => 
                          node.id === session.current_node_id && node.isEndNode
                        ) ? 'default' : 'secondary'
                      }
                    >
                      {session.application?.menu_structure?.find((node: MenuNode) => 
                        node.id === session.current_node_id && node.isEndNode
                      ) ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
