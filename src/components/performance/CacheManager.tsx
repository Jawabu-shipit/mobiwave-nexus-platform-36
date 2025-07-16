
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from '@tanstack/react-query';
import { useCacheOptimization, usePerformanceMonitoring } from '@/hooks/usePerformanceOptimization';
import { Trash2, Zap, Activity, MemoryStick } from 'lucide-react';

export function CacheManager() {
  const queryClient = useQueryClient();
  const { clearStaleCache, optimizeMemoryUsage } = useCacheOptimization();
  const { metrics, getMemoryUsage } = usePerformanceMonitoring();

  const cacheStats = queryClient.getQueryCache().getAll();
  const activeCacheCount = cacheStats.filter(query => query.state.data !== undefined).length;
  const staleCacheCount = cacheStats.filter(query => query.isStale()).length;

  useEffect(() => {
    getMemoryUsage();
  }, []);

  const handleClearAll = () => {
    queryClient.clear();
  };

  const handleClearStale = () => {
    clearStaleCache();
  };

  const handleOptimizeMemory = () => {
    optimizeMemoryUsage();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Cache & Performance Management</h3>
        <p className="text-gray-600 text-sm">Monitor and optimize application performance</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Load Time</p>
                <p className="text-lg font-bold">{metrics.loadTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Render Time</p>
                <p className="text-lg font-bold">{metrics.renderTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-lg font-bold">{metrics.memoryUsage}MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-lg font-bold">{metrics.cacheHitRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cache Statistics</span>
            <div className="flex gap-2">
              <Badge variant="outline">{activeCacheCount} Active</Badge>
              <Badge variant="secondary">{staleCacheCount} Stale</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{cacheStats.length}</p>
                <p className="text-sm text-gray-600">Total Queries</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{activeCacheCount}</p>
                <p className="text-sm text-gray-600">Active Cache</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{staleCacheCount}</p>
                <p className="text-sm text-gray-600">Stale Cache</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleClearStale} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Stale
              </Button>
              <Button onClick={handleOptimizeMemory} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Optimize Memory
              </Button>
              <Button onClick={handleClearAll} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Details */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cacheStats.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {Array.isArray(query.queryKey) ? query.queryKey.join(' → ') : 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(query.state.dataUpdatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={query.state.data ? "default" : "secondary"}>
                    {query.state.data ? "Cached" : "Empty"}
                  </Badge>
                  {query.isStale() && <Badge variant="outline">Stale</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
