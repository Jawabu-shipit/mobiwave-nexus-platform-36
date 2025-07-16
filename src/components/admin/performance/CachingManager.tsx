
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  RefreshCw, 
  Trash2, 
  Settings,
  TrendingUp,
  Database
} from 'lucide-react';

interface CacheEntry {
  key: string;
  size: string;
  hitRate: number;
  lastAccessed: string;
  ttl: number;
  enabled: boolean;
}

export function CachingManager() {
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([
    {
      key: 'user_services_*',
      size: '2.4 MB',
      hitRate: 94,
      lastAccessed: '2 minutes ago',
      ttl: 300,
      enabled: true
    },
    {
      key: 'analytics_data_*',
      size: '8.1 MB',
      hitRate: 87,
      lastAccessed: '5 minutes ago',
      ttl: 600,
      enabled: true
    },
    {
      key: 'service_catalog',
      size: '512 KB',
      hitRate: 98,
      lastAccessed: '1 minute ago',
      ttl: 1800,
      enabled: true
    },
    {
      key: 'user_permissions_*',
      size: '1.2 MB',
      hitRate: 76,
      lastAccessed: '8 minutes ago',
      ttl: 900,
      enabled: false
    }
  ]);

  const [isClearing, setIsClearing] = useState(false);

  const clearCache = async (key: string) => {
    setIsClearing(true);
    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsClearing(false);
  };

  const toggleCache = (key: string) => {
    setCacheEntries(prev => prev.map(entry => 
      entry.key === key ? { ...entry, enabled: !entry.enabled } : entry
    ));
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 90) return 'text-green-600';
    if (hitRate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalCacheSize = cacheEntries.reduce((acc, entry) => {
    const size = parseFloat(entry.size);
    const unit = entry.size.split(' ')[1];
    return acc + (unit === 'MB' ? size : size / 1024);
  }, 0);

  const avgHitRate = cacheEntries.reduce((acc, entry) => acc + entry.hitRate, 0) / cacheEntries.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Cache Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCacheSize.toFixed(1)} MB</div>
            <p className="text-xs text-gray-600">Across all cache keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHitRate.toFixed(1)}%</div>
            <Progress value={avgHitRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Active Caches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheEntries.filter(entry => entry.enabled).length}/{cacheEntries.length}
            </div>
            <p className="text-xs text-gray-600">Enabled cache keys</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cache Management</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearCache('all')}
                disabled={isClearing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
                Clear All
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cacheEntries.map((entry, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="font-medium">{entry.key}</code>
                      <Badge variant={entry.enabled ? "default" : "secondary"}>
                        {entry.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Switch
                        checked={entry.enabled}
                        onCheckedChange={() => toggleCache(entry.key)}
                      />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Size: {entry.size}</span>
                      <span className={getHitRateColor(entry.hitRate)}>
                        Hit Rate: {entry.hitRate}%
                      </span>
                      <span>TTL: {entry.ttl}s</span>
                      <span>Last accessed: {entry.lastAccessed}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => clearCache(entry.key)}
                      disabled={isClearing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={entry.hitRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">Increase TTL for service_catalog</div>
              <div className="text-sm text-blue-700">
                This cache has a 98% hit rate. Consider increasing TTL from 30 minutes to 1 hour.
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-900">Review user_permissions_* cache</div>
              <div className="text-sm text-yellow-700">
                Low hit rate (76%). Consider adjusting caching strategy or TTL.
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">Excellent performance</div>
              <div className="text-sm text-green-700">
                user_services_* and analytics_data_* caches are performing well.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
