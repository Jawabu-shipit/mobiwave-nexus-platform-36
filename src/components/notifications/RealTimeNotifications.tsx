
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, AlertCircle, MessageSquare, BarChart3 } from 'lucide-react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'campaign' | 'survey' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const RealTimeNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const { updates, isConnected } = useRealTimeUpdates({
    userId: user?.id,
    onUpdate: (update) => {
      const notification: Notification = {
        id: `${update.type}-${Date.now()}`,
        type: update.type,
        title: getNotificationTitle(update),
        message: getNotificationMessage(update),
        timestamp: update.timestamp,
        read: false,
        priority: getNotificationPriority(update)
      };

      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    }
  });

  const getNotificationTitle = (update: any): string => {
    switch (update.type) {
      case 'campaign':
        return 'Campaign Update';
      case 'survey':
        return 'Survey Activity';
      case 'system':
        return 'System Notification';
      default:
        return 'New Update';
    }
  };

  const getNotificationMessage = (update: any): string => {
    switch (update.type) {
      case 'campaign':
        if (update.action === 'update' && update.data.status === 'completed') {
          return `Campaign "${update.data.name}" completed successfully`;
        } else if (update.action === 'update' && update.data.status === 'failed') {
          return `Campaign "${update.data.name}" failed`;
        }
        return `Campaign "${update.data.name}" updated`;
      case 'survey':
        if (update.data.type === 'new_response') {
          return 'New survey response received';
        }
        return `Survey "${update.data.title}" updated`;
      default:
        return 'System update received';
    }
  };

  const getNotificationPriority = (update: any): 'low' | 'medium' | 'high' => {
    if (update.type === 'campaign' && update.data.status === 'failed') return 'high';
    if (update.type === 'survey' && update.data.type === 'new_response') return 'medium';
    return 'low';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <MessageSquare className="w-4 h-4" />;
      case 'survey':
        return <BarChart3 className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showPanel && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {!isConnected && (
                  <Badge variant="destructive" className="text-xs">Offline</Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                  <Check className="w-3 h-3 mr-1" />
                  Mark All Read
                </Button>
                <Button size="sm" variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
