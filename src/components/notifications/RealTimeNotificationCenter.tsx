
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, Info, X, Zap, Send, FileText, CreditCard, Layers } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source?: 'campaign' | 'survey' | 'payment' | 'service' | 'system' | 'message';
  sourceId?: string;
  optimistic?: boolean;
}

export function RealTimeNotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use our enhanced real-time updates hook
  const { updates, isConnected, wsConnected } = useRealTimeUpdates({
    userId: user?.id,
    enableNotifications: false, // We'll handle notifications ourselves
    tables: ['user_service_activations', 'service_activation_requests', 'campaigns', 'surveys', 'payment_transactions', 'notifications']
  });
  
  // Convert real-time updates to notifications
  useEffect(() => {
    if (updates.length === 0) return;
    
    // Get the latest update
    const latestUpdate = updates[0];
    
    // Skip if we've already processed this update
    if (notifications.some(n => n.sourceId === latestUpdate.id && n.timestamp === latestUpdate.timestamp)) {
      return;
    }
    
    // Convert update to notification
    let notification: Omit<Notification, 'id' | 'read'> | null = null;
    
    if (latestUpdate.type === 'campaign') {
      const campaign = latestUpdate.data;
      if (latestUpdate.action === 'update' && campaign.status === 'completed') {
        notification = {
          type: 'success',
          title: 'Campaign Completed',
          message: `Campaign "${campaign.name}" has completed successfully.`,
          timestamp: latestUpdate.timestamp,
          source: 'campaign',
          sourceId: campaign.id,
          optimistic: latestUpdate.optimistic
        };
      } else if (latestUpdate.action === 'update' && campaign.status === 'sending') {
        notification = {
          type: 'info',
          title: 'Campaign Started',
          message: `Campaign "${campaign.name}" is now sending.`,
          timestamp: latestUpdate.timestamp,
          source: 'campaign',
          sourceId: campaign.id,
          optimistic: latestUpdate.optimistic
        };
      } else if (latestUpdate.action === 'update' && campaign.status === 'failed') {
        notification = {
          type: 'error',
          title: 'Campaign Failed',
          message: `Campaign "${campaign.name}" has failed.`,
          timestamp: latestUpdate.timestamp,
          source: 'campaign',
          sourceId: campaign.id,
          optimistic: latestUpdate.optimistic
        };
      }
    } else if (latestUpdate.type === 'survey') {
      if (latestUpdate.data.type === 'new_response') {
        notification = {
          type: 'info',
          title: 'New Survey Response',
          message: 'You have received a new survey response.',
          timestamp: latestUpdate.timestamp,
          source: 'survey',
          sourceId: latestUpdate.data.survey_id,
          optimistic: latestUpdate.optimistic
        };
      } else if (latestUpdate.action === 'update' && latestUpdate.data.status === 'active') {
        notification = {
          type: 'success',
          title: 'Survey Activated',
          message: `Survey "${latestUpdate.data.title}" is now active.`,
          timestamp: latestUpdate.timestamp,
          source: 'survey',
          sourceId: latestUpdate.data.id,
          optimistic: latestUpdate.optimistic
        };
      }
    } else if (latestUpdate.type === 'payment') {
      const payment = latestUpdate.data;
      if (latestUpdate.action === 'update' && payment.status === 'completed') {
        notification = {
          type: 'success',
          title: 'Payment Completed',
          message: `Payment of ${payment.amount} has been completed successfully.`,
          timestamp: latestUpdate.timestamp,
          source: 'payment',
          sourceId: payment.id,
          optimistic: latestUpdate.optimistic
        };
      } else if (latestUpdate.action === 'update' && payment.status === 'failed') {
        notification = {
          type: 'error',
          title: 'Payment Failed',
          message: `Payment of ${payment.amount} has failed.`,
          timestamp: latestUpdate.timestamp,
          source: 'payment',
          sourceId: payment.id,
          optimistic: latestUpdate.optimistic
        };
      }
    } else if (latestUpdate.type === 'service') {
      const service = latestUpdate.data;
      if (latestUpdate.action === 'update') {
        notification = {
          type: 'info',
          title: 'Service Updated',
          message: `Service "${service.name || 'Unknown'}" status updated to ${service.status || 'unknown'}.`,
          timestamp: latestUpdate.timestamp,
          source: 'service',
          sourceId: service.id,
          optimistic: latestUpdate.optimistic
        };
      } else if (latestUpdate.action === 'insert') {
        notification = {
          type: 'success',
          title: 'Service Activated',
          message: `New service "${service.name || 'Unknown'}" has been activated.`,
          timestamp: latestUpdate.timestamp,
          source: 'service',
          sourceId: service.id,
          optimistic: latestUpdate.optimistic
        };
      }
    } else if (latestUpdate.type === 'system') {
      notification = {
        type: 'info',
        title: 'System Update',
        message: latestUpdate.data.message || 'System update received.',
        timestamp: latestUpdate.timestamp,
        source: 'system',
        sourceId: latestUpdate.id,
        optimistic: latestUpdate.optimistic
      };
    }
    
    // Add notification if we created one
    if (notification) {
      addNotification({
        ...notification,
        id: crypto.randomUUID(),
        read: false
      });
    }
  }, [updates]);
  
  // Also fetch notifications from the database
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .is('read_at', null)  // Using is(null) instead of eq(false) for read_at
          .order('created_at', { ascending: false })
          .limit(10) as { 
            data: Array<{
              id: string;
              type: string;
              title: string;
              message: string;
              created_at: string;
              read_at: string | null;
            }> | null; 
            error: any 
          };
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const dbNotifications: Notification[] = data.map(n => ({
            id: n.id,
            type: n.type as 'success' | 'warning' | 'info' | 'error',
            title: n.title,
            message: n.message,
            timestamp: n.created_at,
            read: n.read_at !== null,
            source: 'system',
            sourceId: n.id
          }));
          
          // Add notifications that don't already exist
          dbNotifications.forEach(notification => {
            if (!notifications.some(n => n.id === notification.id)) {
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    // Set up interval to check for new notifications
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const addNotification = useCallback((notification: Notification) => {
    // Check if this notification already exists
    setNotifications(prev => {
      // If notification with same sourceId and timestamp exists, don't add it
      if (notification.sourceId && prev.some(n => 
        n.sourceId === notification.sourceId && 
        n.timestamp === notification.timestamp
      )) {
        return prev;
      }
      
      // If this is a non-optimistic update replacing an optimistic one, replace it
      if (notification.sourceId && !notification.optimistic) {
        const hasOptimistic = prev.some(n => 
          n.sourceId === notification.sourceId && n.optimistic
        );
        
        if (hasOptimistic) {
          return prev.map(n => 
            n.sourceId === notification.sourceId && n.optimistic
              ? { ...notification, id: n.id, read: n.read }
              : n
          );
        }
      }
      
      // Otherwise add as new notification
      return [notification, ...prev].slice(0, 20);
    });
    
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // If this is a database notification, update it in the database
    if (notification?.source === 'system' && notification.sourceId) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notification.sourceId) as { data: any; error: any };
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const clearAll = async () => {
    // Update local state
    setNotifications([]);
    setUnreadCount(0);
    
    // Update database notifications
    if (user?.id) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .is('read_at', null) as { data: any; error: any };
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const getIcon = (notification: Notification) => {
    // First check the source
    if (notification.source === 'campaign') {
      return <Send className="w-4 h-4 text-blue-600" />;
    } else if (notification.source === 'survey') {
      return <FileText className="w-4 h-4 text-purple-600" />;
    } else if (notification.source === 'payment') {
      return <CreditCard className="w-4 h-4 text-green-600" />;
    } else if (notification.source === 'service') {
      return <Layers className="w-4 h-4 text-indigo-600" />;
    } else if (notification.source === 'system' && notification.optimistic) {
      return <Zap className="w-4 h-4 text-amber-600" />;
    }
    
    // Fall back to type
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className={`w-5 h-5 ${isConnected || wsConnected ? 'text-green-600' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-[80vh] overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Notifications
                {(isConnected || wsConnected) && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Live
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="max-h-[calc(80vh-100px)] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    } ${notification.optimistic ? 'bg-amber-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {notification.title}
                          {notification.optimistic && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
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
}
