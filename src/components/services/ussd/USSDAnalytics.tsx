
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { AnalyticsData } from './types';

interface USSDAnalyticsProps {
  applicationId?: string;
  timeRange?: string;
}

export function USSDAnalytics({ applicationId, timeRange = '7d' }: USSDAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['ussd-analytics', applicationId, timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const now = new Date();
      const daysAgo = parseInt(timeRange.replace('d', ''));
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      try {
        let query = supabase
          .from('ussd_sessions')
          .select('*')
          .gte('created_at', startDate.toISOString());

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data: sessions, error } = await query;
        if (error) {
          console.warn('Error fetching USSD sessions:', error);
          return {
            totalSessions: 0,
            uniqueUsers: 0,
            avgSessionDuration: 0,
            topMenuPaths: [],
            completionRate: 0,
            peakHours: []
          };
        }

        const sessionData = sessions || [];
        const totalSessions = sessionData.length;
        const uniqueUsers = new Set(sessionData.map(s => s.phone_number)).size;
        
        const avgSessionDuration = sessionData.reduce((acc, s) => acc + (s.input_path?.length || 0), 0) / (totalSessions || 1);

        const completedSessions = sessionData.filter(s => s.status === 'completed').length;
        const completionRate = (completedSessions / (totalSessions || 1)) * 100;

        const pathCounts: Record<string, number> = {};
        sessionData.forEach(s => {
          const pathKey = (s.navigation_path || []).join(' → ');
          if (pathKey) {
            pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
          }
        });

        const topMenuPaths = Object.entries(pathCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([path, count]) => ({ path, count }));

        const hourCounts: Record<number, number> = {};
        sessionData.forEach(s => {
          const hour = new Date(s.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHours = Object.entries(hourCounts)
          .map(([hour, sessions]) => ({ hour: parseInt(hour), sessions }))
          .sort((a, b) => b.sessions - a.sessions)
          .slice(0, 6);

        return {
          totalSessions,
          uniqueUsers,
          avgSessionDuration,
          topMenuPaths,
          completionRate,
          peakHours
        };
      } catch (error) {
        console.error('Failed to fetch USSD analytics:', error);
        return {
          totalSessions: 0,
          uniqueUsers: 0,
          avgSessionDuration: 0,
          topMenuPaths: [],
          completionRate: 0,
          peakHours: []
        };
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{analytics.totalSessions}</p>
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
                <p className="text-2xl font-bold">{analytics.uniqueUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{analytics.avgSessionDuration.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Menu Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Menu Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topMenuPaths.map((path, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{path.path}</p>
                  </div>
                  <Badge variant="secondary">{path.count} sessions</Badge>
                </div>
              ))}
              {analytics.topMenuPaths.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No menu paths data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Usage Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.peakHours.map((peak, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {peak.hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(peak.sessions / Math.max(...analytics.peakHours.map(p => p.sessions)) * 100)}%` 
                        }}
                      />
                    </div>
                    <Badge variant="outline">{peak.sessions}</Badge>
                  </div>
                </div>
              ))}
              {analytics.peakHours.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No peak hours data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
