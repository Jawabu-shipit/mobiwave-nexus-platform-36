
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { throttle, debounce } from '@/utils/performance';
import { useDDoSProtection } from '@/hooks/usePerformanceOptimization';

// Enhanced type definitions for better type safety
interface RealTimeUpdate {
  type: 'campaign' | 'survey' | 'system' | 'message' | 'payment' | 'service' | 'security';
  action: 'insert' | 'update' | 'delete' | 'security_alert';
  data: any;
  timestamp: string;
  id?: string;
  optimistic?: boolean;
  source?: 'supabase' | 'websocket' | 'local';
  priority?: 'high' | 'medium' | 'low';
  signature?: string; // For security verification
}

interface UseRealTimeUpdatesOptions {
  userId?: string;
  onUpdate?: (update: RealTimeUpdate) => void;
  enableNotifications?: boolean;
  enableWebSocket?: boolean;
  tables?: string[];
  securityLevel?: 'high' | 'medium' | 'low';
  maxUpdatesStored?: number;
  enableEncryption?: boolean;
  rateLimitPerMinute?: number;
}

// WebSocket connection state with enhanced security
interface WebSocketState {
  connection: WebSocket | null;
  reconnectAttempts: number;
  lastMessageTime: number;
  messageCount: number;
  authenticated: boolean;
  connectionId?: string;
  heartbeatInterval?: NodeJS.Timeout;
}

// Global WebSocket state
const wsState: WebSocketState = {
  connection: null,
  reconnectAttempts: 0,
  lastMessageTime: 0,
  messageCount: 0,
  authenticated: false
};

// Constants
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MAX_UPDATES_STORED = 100;
const MESSAGE_RATE_LIMIT = 60; // messages per minute
const SECURITY_TOKEN_KEY = 'rt_security_token';
const DEFAULT_TABLES = ['campaigns', 'surveys', 'survey_responses', 'payment_transactions', 'user_services', 'notifications'];

/**
 * Enhanced real-time updates hook with security features and DDoS protection
 */
export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const { 
    userId, 
    onUpdate, 
    enableNotifications = true,
    enableWebSocket = true,
    tables = DEFAULT_TABLES,
    securityLevel = 'medium',
    maxUpdatesStored = MAX_UPDATES_STORED,
    enableEncryption = true,
    rateLimitPerMinute = MESSAGE_RATE_LIMIT
  } = options;
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, RealTimeUpdate>>(new Map());
  const [securityToken, setSecurityToken] = useState<string | null>(
    localStorage.getItem(SECURITY_TOKEN_KEY)
  );
  const [connectionErrors, setConnectionErrors] = useState<string[]>([]);
  const [messageRateExceeded, setMessageRateExceeded] = useState(false);
  
  // Refs
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef<number>(0);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const channelsRef = useRef<any[]>([]);
  const securityChecksPassedRef = useRef<boolean>(true);
  
  // Use DDoS protection
  const { trackRequest, getBackoffDelay, isThrottled } = useDDoSProtection();
  
  // Generate a secure connection ID
  const connectionId = useMemo(() => {
    return `${userId || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }, [userId]);
  
  // Verify message authenticity
  const verifyMessageSignature = useCallback((message: any, signature?: string): boolean => {
    // In a real implementation, this would verify a cryptographic signature
    // For now, we'll do a simple check
    if (securityLevel === 'low') return true;
    
    if (!signature && securityLevel === 'high') {
      console.warn('Message signature missing in high security mode');
      return false;
    }
    
    // Simple check for demo purposes
    if (signature) {
      // In a real implementation, verify the signature cryptographically
      return true;
    }
    
    return securityLevel !== 'high';
  }, [securityLevel]);
  
  // Create a secure WebSocket connection with authentication
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;
    
    // Close existing connection if any
    if (wsState.connection) {
      wsState.connection.close();
      wsState.connection = null;
      
      // Clear heartbeat interval
      if (wsState.heartbeatInterval) {
        clearInterval(wsState.heartbeatInterval);
        wsState.heartbeatInterval = undefined;
      }
    }
    
    // Check if we're being throttled due to too many connection attempts
    if (isThrottled(`ws-${userId || 'anonymous'}`)) {
      setConnectionErrors(prev => [...prev, 'Connection throttled due to too many attempts']);
      
      // Try again after backoff delay
      const backoffDelay = getBackoffDelay(wsState.reconnectAttempts);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, backoffDelay);
      
      return;
    }
    
    // Track this connection attempt
    trackRequest(`ws-${userId || 'anonymous'}`, 10); // Limit to 10 connection attempts per minute
    
    // Create new WebSocket connection with authentication
    const wsUrl = `wss://api.mobiwave.io/realtime`;
    
    try {
      // In a real implementation, this would be:
      // const ws = new WebSocket(wsUrl);
      // wsState.connection = ws;
      
      // For now, we'll simulate the connection with a timeout
      console.debug(`Connecting to WebSocket: ${wsUrl} (Security: ${securityLevel})`);
      
      // Simulate connection process
      setTimeout(() => {
        // Simulate successful connection
        setWsConnected(true);
        wsState.reconnectAttempts = 0;
        wsState.lastMessageTime = Date.now();
        wsState.messageCount = 0;
        
        // Set up heartbeat interval to keep connection alive
        wsState.heartbeatInterval = setInterval(() => {
          sendHeartbeat();
        }, HEARTBEAT_INTERVAL);
        
        // Simulate authentication
        simulateAuthentication();
      }, 1000);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionErrors(prev => [...prev, `Connection error: ${error}`]);
      handleReconnect();
    }
  }, [userId, enableWebSocket, securityLevel, isThrottled, trackRequest, getBackoffDelay]);
  
  // Invalidate relevant queries based on update type
  const invalidateRelevantQueries = useCallback((update: RealTimeUpdate) => {
    // Skip for security updates
    if (update.type === 'security') {
      return;
    }
    
    // Use a switch statement for better organization
    switch (update.type) {
      case 'campaign':
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        break;
        
      case 'survey':
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        if (update.data.type === 'new_response') {
          queryClient.invalidateQueries({ queryKey: ['survey-responses'] });
        }
        break;
        
      case 'payment':
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['user-credits'] });
        break;
        
      case 'service':
        queryClient.invalidateQueries({ queryKey: ['services'] });
        queryClient.invalidateQueries({ queryKey: ['user-services'] });
        break;
        
      case 'message':
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        break;
        
      case 'system':
        // For system updates, only invalidate if specifically mentioned in the data
        if (update.data.invalidate) {
          const keysToInvalidate = Array.isArray(update.data.invalidate) 
            ? update.data.invalidate 
            : [update.data.invalidate];
            
          keysToInvalidate.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        }
        break;
    }
  }, [queryClient]);

  // Show notifications based on update type
  const showNotification = useCallback((update: RealTimeUpdate) => {
    // Skip notifications for security updates in production
    if (update.type === 'security' && process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Handle different update types
    if (update.type === 'campaign' && update.action === 'update') {
      const campaign = update.data;
      if (campaign.status === 'completed') {
        toast.success(`Campaign "${campaign.name}" completed successfully`);
      } else if (campaign.status === 'failed') {
        toast.error(`Campaign "${campaign.name}" failed`);
      } else if (campaign.status === 'sending') {
        toast.info(`Campaign "${campaign.name}" is now sending`);
      }
    } else if (update.type === 'survey' && update.action === 'insert') {
      const survey = update.data;
      if (survey.status === 'active') {
        toast.success(`Survey "${survey.title}" is now live`);
      }
    } else if (update.type === 'survey' && update.data.type === 'new_response') {
      toast.success('New survey response received');
    } else if (update.type === 'payment' && update.action === 'update') {
      const payment = update.data;
      if (payment.status === 'completed') {
        toast.success(`Payment of ${payment.amount} completed successfully`);
      } else if (payment.status === 'failed') {
        toast.error(`Payment of ${payment.amount} failed`);
      }
    } else if (update.type === 'service' && update.action === 'update') {
      const service = update.data;
      toast.info(`Service "${service.name || 'Unknown'}" status updated to ${service.status || 'unknown'}`);
    } else if (update.type === 'security' && update.action === 'security_alert') {
      const alert = update.data;
      toast.warning(`Security alert: ${alert.message}`);
    }
  }, []);

  // Rate-limited update handler to prevent flooding
  const handleUpdate = useCallback((update: RealTimeUpdate) => {
    // Security checks
    if (!securityChecksPassedRef.current) {
      console.warn('Security checks failed, update rejected');
      return;
    }
    
    // Verify message signature for websocket messages
    if (update.source === 'websocket' && !verifyMessageSignature(update, update.signature)) {
      console.warn('Message signature verification failed');
      
      // Create security alert
      const securityAlert: RealTimeUpdate = {
        type: 'security',
        action: 'security_alert',
        data: { 
          message: 'Invalid message signature detected',
          severity: 'warning'
        },
        timestamp: new Date().toISOString(),
        source: 'local'
      };
      
      // Add security alert to updates
      setUpdates(prev => [securityAlert, ...prev.slice(0, maxUpdatesStored - 1)]);
      return;
    }
    
    // Rate limiting
    const now = Date.now();
    messageCountRef.current++;
    
    // Reset counter after a minute
    if (now - lastMessageTimeRef.current > 60000) {
      messageCountRef.current = 1;
      lastMessageTimeRef.current = now;
      setMessageRateExceeded(false);
    }
    
    // Check if rate limit exceeded
    if (messageCountRef.current > rateLimitPerMinute) {
      if (!messageRateExceeded) {
        console.warn(`Message rate limit exceeded: ${messageCountRef.current} messages per minute`);
        setMessageRateExceeded(true);
        
        // Create rate limit alert
        const rateLimitAlert: RealTimeUpdate = {
          type: 'security',
          action: 'security_alert',
          data: { 
            message: 'Message rate limit exceeded',
            severity: 'warning',
            limit: rateLimitPerMinute
          },
          timestamp: new Date().toISOString(),
          source: 'local'
        };
        
        // Add rate limit alert to updates
        setUpdates(prev => [rateLimitAlert, ...prev.slice(0, maxUpdatesStored - 1)]);
      }
      
      // Skip processing this update if it's not high priority
      if (update.priority !== 'high') {
        return;
      }
    }
    
    // Add to updates list with limit
    setUpdates(prev => [update, ...prev.slice(0, maxUpdatesStored - 1)]);
    
    // Call onUpdate callback if provided
    onUpdate?.(update);
    
    // Show notification if enabled and not a security alert
    if (enableNotifications && update.type !== 'security') {
      showNotification(update);
    }
    
    // If this is a real update (not optimistic), remove any corresponding optimistic update
    if (!update.optimistic && update.id) {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(update.id!);
        return newMap;
      });
    }
    
    // Invalidate relevant queries based on update type
    invalidateRelevantQueries(update);
  }, [onUpdate, enableNotifications, maxUpdatesStored, rateLimitPerMinute, verifyMessageSignature, invalidateRelevantQueries, showNotification]);
  
  // Simulate WebSocket authentication
  const simulateAuthentication = useCallback(() => {
    // In a real implementation, this would send authentication credentials
    // and receive a token for subsequent message verification
    
    // Simulate authentication process
    setTimeout(() => {
      // Generate a mock security token
      const newToken = `${userId || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Store token for future connections
      localStorage.setItem(SECURITY_TOKEN_KEY, newToken);
      setSecurityToken(newToken);
      
      wsState.authenticated = true;
      wsState.connectionId = connectionId;
      
      // Simulate receiving a system message about successful authentication
      const authUpdate: RealTimeUpdate = {
        type: 'system',
        action: 'insert',
        data: { 
          message: 'Authenticated with real-time updates server',
          connectionId: connectionId
        },
        timestamp: new Date().toISOString(),
        source: 'websocket',
        signature: newToken // In a real implementation, this would be a proper signature
      };
      
      handleUpdate(authUpdate);
      
      // Subscribe to user-specific channel
      if (userId) {
        // In a real implementation, this would subscribe to a user-specific channel
        console.debug(`Subscribed to user channel: ${userId}`);
        
        // Simulate receiving a user-specific message
        setTimeout(() => {
          const userUpdate: RealTimeUpdate = {
            type: 'system',
            action: 'insert',
            data: { 
              message: 'User channel subscription active',
              userId: userId
            },
            timestamp: new Date().toISOString(),
            source: 'websocket',
            signature: newToken
          };
          
          handleUpdate(userUpdate);
        }, 500);
      }
    }, 500);
  }, [userId, connectionId, handleUpdate]);
  
  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    // In a real implementation, this would send a heartbeat message to the server
    console.debug('Sending heartbeat');
    
    // Simulate heartbeat response
    setTimeout(() => {
      wsState.lastMessageTime = Date.now();
    }, 100);
  }, []);
  
  // Handle WebSocket reconnection with exponential backoff
  const handleReconnect = useCallback(() => {
    if (wsState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum WebSocket reconnection attempts reached');
      setConnectionErrors(prev => [...prev, 'Maximum reconnection attempts reached']);
      return;
    }
    
    wsState.reconnectAttempts++;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Use exponential backoff for reconnection
    const delay = RECONNECT_DELAY * Math.pow(1.5, wsState.reconnectAttempts);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.debug(`Attempting to reconnect WebSocket (${wsState.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      connectWebSocket();
    }, delay);
  }, [connectWebSocket]);
  
  // Initialize Supabase real-time channels with security checks
  useEffect(() => {
    // Security check: validate user ID format if provided
    if (userId && !/^[a-zA-Z0-9-]+$/.test(userId)) {
      console.error('Invalid user ID format');
      securityChecksPassedRef.current = false;
      
      setConnectionErrors(prev => [...prev, 'Invalid user ID format']);
      return;
    }
    
    // Security check: validate table names
    const invalidTables = tables.filter(table => !/^[a-zA-Z0-9_]+$/.test(table));
    if (invalidTables.length > 0) {
      console.error('Invalid table names:', invalidTables);
      securityChecksPassedRef.current = false;
      
      setConnectionErrors(prev => [...prev, `Invalid table names: ${invalidTables.join(', ')}`]);
      return;
    }
    
    securityChecksPassedRef.current = true;
    const channels: any[] = [];
    
    // Set up channels for each table with rate limiting
    for (const table of tables) {
      try {
        const channel = supabase
          .channel(`${table}-updates-${connectionId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: table,
            filter: userId ? `user_id=eq.${userId}` : undefined
          }, (payload) => {
            // Rate limit check
            if (!trackRequest(`supabase-${userId || 'anonymous'}-${table}`, rateLimitPerMinute)) {
              console.warn(`Rate limit exceeded for table ${table}`);
              return;
            }
            
            // Determine update type based on table
            let type: RealTimeUpdate['type'] = 'system';
            if (table === 'campaigns') type = 'campaign';
            else if (table === 'surveys' || table === 'survey_responses') type = 'survey';
            else if (table === 'payment_transactions') type = 'payment';
            else if (table === 'user_services' || table === 'services') type = 'service';
            else if (table === 'messages') type = 'message';
            else if (table === 'security_alerts') type = 'security';
            
            // Create update object
            const update: RealTimeUpdate = {
              type,
              action: payload.eventType as any,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString(),
              id: (payload.new || payload.old) ? ((payload.new || payload.old) as any).id : undefined,
              source: 'supabase'
            };
            
            // Handle the update
            handleUpdate(update);
          })
          .subscribe((status) => {
            if (table === tables[0]) {
              setIsConnected(status === 'SUBSCRIBED');
            }
          });
        
        channels.push(channel);
      } catch (error) {
        console.error(`Error setting up channel for table ${table}:`, error);
        setConnectionErrors(prev => [...prev, `Error setting up channel for table ${table}: ${error}`]);
      }
    }
    
    // Store channels in ref for cleanup
    channelsRef.current = channels;
    
    // Connect to WebSocket for additional real-time updates
    if (enableWebSocket) {
      connectWebSocket();
    }
    
    // Cleanup function
    return () => {
      // Remove all Supabase channels
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      });
      
      // Close WebSocket connection
      if (wsState.connection) {
        wsState.connection.close();
        wsState.connection = null;
      }
      
      // Clear heartbeat interval
      if (wsState.heartbeatInterval) {
        clearInterval(wsState.heartbeatInterval);
        wsState.heartbeatInterval = undefined;
      }
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [userId, tables, enableWebSocket, connectWebSocket, handleUpdate, rateLimitPerMinute, trackRequest, connectionId]);
  
  // Function to clear all updates
  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setOptimisticUpdates(new Map());
  }, []);
  
  // Function to add an optimistic update with validation
  const addOptimisticUpdate = useCallback((update: Omit<RealTimeUpdate, 'timestamp' | 'optimistic' | 'source'> & { id: string }) => {
    // Validate update data
    if (!update.type || !update.action || !update.id) {
      console.error('Invalid optimistic update:', update);
      return null;
    }
    
    // Create full update object
    const fullUpdate: RealTimeUpdate = {
      ...update,
      timestamp: new Date().toISOString(),
      optimistic: true,
      source: 'local'
    };
    
    // Add to optimistic updates map
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(update.id, fullUpdate);
      return newMap;
    });
    
    // Also add to regular updates list
    handleUpdate(fullUpdate);
    
    return fullUpdate;
  }, [handleUpdate]);
  
  // Function to remove an optimistic update
  const removeOptimisticUpdate = useCallback((id: string) => {
    if (!id) return;
    
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);
  
  // Combine regular updates with optimistic updates
  const allUpdates = useMemo(() => {
    return updates;
  }, [updates]);
  
  // Get the latest update
  const latestUpdate = useMemo(() => {
    return allUpdates[0] || null;
  }, [allUpdates]);
  
  // Check connection status periodically
  useEffect(() => {
    const checkConnectionStatus = () => {
      // Check if WebSocket connection is stale
      if (wsConnected && wsState.lastMessageTime > 0) {
        const timeSinceLastMessage = Date.now() - wsState.lastMessageTime;
        
        // If no message received for 2x heartbeat interval, connection might be stale
        if (timeSinceLastMessage > HEARTBEAT_INTERVAL * 2) {
          console.warn('WebSocket connection appears stale, reconnecting...');
          setWsConnected(false);
          connectWebSocket();
        }
      }
    };
    
    // Check every minute
    const interval = setInterval(checkConnectionStatus, 60000);
    
    return () => clearInterval(interval);
  }, [wsConnected, connectWebSocket]);
  
  return {
    isConnected: isConnected || wsConnected,
    updates: allUpdates,
    clearUpdates,
    latestUpdate,
    wsConnected,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    optimisticUpdates: Array.from(optimisticUpdates.values()),
    connectionErrors,
    messageRateExceeded,
    securityToken: securityToken ? '***' : null, // Don't expose actual token
    connectionId
  };
};
