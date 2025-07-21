import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertCircle,
  Eye,
  Settings,
} from "lucide-react";
import { useRealTimeMspaceSync } from "@/hooks/useRealTimeMspaceSync";
import { format, formatDistanceToNow } from "date-fns";

export const RealTimeSyncMonitor: React.FC = () => {
  const {
    syncStatus,
    realtimeEvents,
    conflicts,
    resolvedConflicts,
    resolveConflict,
    clearEvents,
    isHealthy,
    timeToNextSync,
    stats,
  } = useRealTimeMspaceSync();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "sync_started":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "sync_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "sync_failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "conflict_detected":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "balance_updated":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = () => {
    if (!isHealthy) return "text-red-500";
    if (syncStatus.failed_operations > 0) return "text-yellow-500";
    return "text-green-500";
  };

  const formatTimeToNext = () => {
    if (!timeToNextSync || timeToNextSync <= 0) return "Now";
    const minutes = Math.floor(timeToNextSync / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-Time Sync Monitor</h3>
        <div className="flex items-center gap-2">
          <Badge
            variant={isHealthy ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <Activity className="h-3 w-3" />
            {isHealthy ? "Healthy" : "Issues Detected"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
            disabled={realtimeEvents.length === 0}
          >
            Clear Events
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${syncStatus.is_syncing ? "bg-blue-500 animate-pulse" : "bg-gray-300"}`}
              />
              <div>
                <p className="text-2xl font-bold">
                  {syncStatus.active_operations}
                </p>
                <p className="text-sm text-muted-foreground">Active Syncs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeConflicts}</p>
                <p className="text-sm text-muted-foreground">Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {syncStatus.failed_operations}
                </p>
                <p className="text-sm text-muted-foreground">Failed (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{formatTimeToNext()}</p>
                <p className="text-sm text-muted-foreground">Next Sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${getHealthColor()}`} />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Auto Sync</span>
                <Badge
                  variant={
                    syncStatus.auto_sync_enabled ? "default" : "secondary"
                  }
                >
                  {syncStatus.auto_sync_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Sync Interval</span>
                <span className="text-sm">
                  {syncStatus.sync_interval_minutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">System Health</span>
                <Badge
                  variant={
                    stats.syncHealth === "healthy" ? "default" : "destructive"
                  }
                >
                  {stats.syncHealth}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <span className="text-sm">
                  {syncStatus.last_sync_at
                    ? formatDistanceToNow(new Date(syncStatus.last_sync_at), {
                        addSuffix: true,
                      })
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Events</span>
                <span className="text-sm">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Resolved Conflicts</span>
                <span className="text-sm">{stats.resolvedConflicts}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {conflicts.length} sync conflicts require attention. Please review
            and resolve them below.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Live Events ({realtimeEvents.length})
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts ({conflicts.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {realtimeEvents.length > 0 ? (
                    realtimeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        {getEventIcon(event.event_type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {event.message}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.timestamp), "HH:mm:ss")}
                            </span>
                          </div>
                          {event.client_id && (
                            <p className="text-xs text-muted-foreground">
                              Client: {event.client_id}
                            </p>
                          )}
                          {event.data && (
                            <details className="mt-1">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                Show details
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No real-time events yet. Events will appear here as they
                      happen.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle>Sync Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              {conflicts.length > 0 ? (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-4 border rounded-lg bg-yellow-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">
                              {conflict.conflict_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                            <Badge variant="outline">
                              {conflict.client_id}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground">
                                Local Data:
                              </p>
                              <pre className="bg-white p-2 rounded text-xs">
                                {JSON.stringify(conflict.local_data, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">
                                Remote Data:
                              </p>
                              <pre className="bg-white p-2 rounded text-xs">
                                {JSON.stringify(conflict.remote_data, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            Detected:{" "}
                            {format(new Date(conflict.detected_at), "PPpp")}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            resolveConflict(conflict.id, "use_local")
                          }
                        >
                          Use Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            resolveConflict(conflict.id, "use_remote")
                          }
                        >
                          Use Remote
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => resolveConflict(conflict.id, "manual")}
                        >
                          Manual Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p>
                    No active conflicts. All sync operations are running
                    smoothly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Conflicts & History</CardTitle>
            </CardHeader>
            <CardContent>
              {resolvedConflicts.length > 0 ? (
                <div className="space-y-2">
                  {resolvedConflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-3 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {conflict.client_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conflict.conflict_type.replace("_", " ")} •
                            Resolved with:{" "}
                            {conflict.resolution_action?.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <CheckCircle className="h-4 w-4 text-green-500 inline" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {conflict.resolved_at &&
                              format(new Date(conflict.resolved_at), "PPp")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No resolved conflicts in history.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
