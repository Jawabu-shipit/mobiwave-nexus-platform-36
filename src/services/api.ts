/**
 * Secure API service layer
 * Provides a centralized interface for all API calls with security features
 */

import { supabase } from '@/integrations/supabase/client';
import { createRateLimitedFetch } from '@/utils/performance';
import { toast } from 'sonner';

// Create rate-limited fetch for external API calls
const secureFetch = createRateLimitedFetch(30, 60000); // 30 requests per minute

// Security constants
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'auth', 'credit_card'];
const ALLOWED_DOMAINS = ['api.mobiwave.io', 'api.supabase.co'];
const API_REQUEST_TIMEOUT = 30000; // 30 seconds

// Request tracking for DDoS protection
const requestTracker = {
  counts: new Map<string, number>(),
  timestamps: new Map<string, number[]>(),
  blockedIps: new Set<string>(),
  lastReset: Date.now(),
  
  track(endpoint: string, ip: string = 'unknown'): boolean {
    // Reset counters every hour
    if (Date.now() - this.lastReset > 3600000) {
      this.counts.clear();
      this.timestamps.clear();
      this.lastReset = Date.now();
    }
    
    // Check if IP is blocked
    if (this.blockedIps.has(ip)) {
      console.warn(`Blocked request from IP: ${ip}`);
      return false;
    }
    
    // Track request count
    const key = `${ip}:${endpoint}`;
    const count = (this.counts.get(key) || 0) + 1;
    this.counts.set(key, count);
    
    // Track request timestamps for rate limiting
    const timestamps = this.timestamps.get(key) || [];
    timestamps.push(Date.now());
    
    // Keep only last 100 timestamps
    if (timestamps.length > 100) {
      timestamps.shift();
    }
    
    this.timestamps.set(key, timestamps);
    
    // Check for suspicious activity
    if (this.detectSuspiciousActivity(key, ip)) {
      return false;
    }
    
    return true;
  },
  
  detectSuspiciousActivity(key: string, ip: string): boolean {
    const count = this.counts.get(key) || 0;
    const timestamps = this.timestamps.get(key) || [];
    
    // Too many requests in total (more than 1000 per hour)
    if (count > 1000) {
      this.blockedIps.add(ip);
      console.error(`Blocking IP ${ip} due to excessive requests: ${count}`);
      return true;
    }
    
    // Too many requests in a short time (more than 30 in 10 seconds)
    if (timestamps.length >= 30) {
      const tenSecondsAgo = Date.now() - 10000;
      const recentRequests = timestamps.filter(t => t > tenSecondsAgo);
      
      if (recentRequests.length >= 30) {
        this.blockedIps.add(ip);
        console.error(`Blocking IP ${ip} due to rate limiting: ${recentRequests.length} requests in 10s`);
        return true;
      }
    }
    
    return false;
  }
};

/**
 * Sanitize data to remove sensitive information
 */
function sanitizeData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in sanitized) {
      // Remove sensitive fields
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Validate URL to prevent SSRF attacks
 */
function isUrlSafe(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Check if domain is allowed
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
    
    // Check for localhost or private IPs
    const isLocalhost = parsedUrl.hostname === 'localhost' || 
                        parsedUrl.hostname === '127.0.0.1' ||
                        parsedUrl.hostname.startsWith('192.168.') ||
                        parsedUrl.hostname.startsWith('10.') ||
                        parsedUrl.hostname.startsWith('172.16.');
    
    return isAllowedDomain && !isLocalhost;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return false;
  }
}

/**
 * Validate payload size to prevent DoS attacks
 */
function isPayloadSafe(data: any): boolean {
  try {
    const size = new TextEncoder().encode(JSON.stringify(data)).length;
    return size <= MAX_PAYLOAD_SIZE;
  } catch (error) {
    console.error('Error checking payload size:', error);
    return false;
  }
}

/**
 * Log API request for audit purposes
 */
function logApiRequest(method: string, endpoint: string, data?: any, userId?: string): void {
  const timestamp = new Date().toISOString();
  const sanitizedData = sanitizeData(data);
  
  // In production, this would send to a secure logging service
  console.debug(`API ${method} ${endpoint} at ${timestamp}${userId ? ` by user ${userId}` : ''}`);
  
  // In development, also log the data
  if (process.env.NODE_ENV === 'development') {
    console.debug('Request data:', sanitizedData);
  }
  
  // In a real implementation, this would log to a secure audit log
  try {
    // Log to Supabase audit_logs table if it exists
    supabase.from('audit_logs' as any).insert({
      user_id: userId,
      action: `API_${method}`,
      resource: endpoint,
      data: sanitizedData,
      timestamp
    }).then(() => {}, (error) => {
      // Ignore errors from audit logging
      if (process.env.NODE_ENV === 'development') {
        console.debug('Audit log error:', error);
      }
    });
  } catch (error) {
    // Ignore errors from audit logging
  }
}

/**
 * Generic error handler for API requests
 */
function handleApiError(error: any, endpoint: string, showToast: boolean = true): never {
  // Log the error
  console.error(`API error for ${endpoint}:`, error);
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(`API request failed: ${error.message || 'Unknown error'}`);
  }
  
  // Throw a standardized error
  throw new Error(`API request to ${endpoint} failed: ${error.message || 'Unknown error'}`);
}

/**
 * Create a request with timeout
 */
async function timeoutRequest<T>(promise: Promise<T>, ms: number, endpoint: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request to ${endpoint} timed out after ${ms}ms`));
    }, ms);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Secure API service
 */
export const api = {
  /**
   * Fetch data from Supabase table with security checks
   */
  async fetch<T = any>(
    table: string, 
    options: { 
      filter?: Record<string, any>,
      select?: string,
      order?: { column: string, ascending?: boolean },
      limit?: number,
      userId?: string,
      single?: boolean
    } = {}
  ): Promise<T> {
    // Security checks
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`fetch:${table}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest('GET', `table/${table}`, options, options.userId);
      
      // Build the query
      let query = supabase.from(table as any).select(options.select || '*');
      
      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending !== false 
        });
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute with timeout
      const result = await timeoutRequest(
        Promise.resolve(options.single ? query.single() : query),
        API_REQUEST_TIMEOUT,
        `fetch:${table}`
      );
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data as T;
    } catch (error) {
      return handleApiError(error, `fetch:${table}`);
    }
  },
  
  /**
   * Create a record in Supabase table with security checks
   */
  async create<T = any>(
    table: string,
    data: Record<string, any>,
    options: {
      userId?: string,
      returnData?: boolean
    } = {}
  ): Promise<T> {
    // Security checks
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    if (!isPayloadSafe(data)) {
      throw new Error('Payload too large');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`create:${table}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest('POST', `table/${table}`, data, options.userId);
      
      // Add user_id if provided
      const payload = options.userId ? { ...data, user_id: options.userId } : data;
      
      // Execute with timeout
      const result = await timeoutRequest(
        Promise.resolve(supabase.from(table as any).insert(payload).select(options.returnData ? '*' : undefined)),
        API_REQUEST_TIMEOUT,
        `create:${table}`
      );
      
      if (result.error) {
        throw result.error;
      }
      
      return (options.returnData ? result.data : { success: true }) as T;
    } catch (error) {
      return handleApiError(error, `create:${table}`);
    }
  },
  
  /**
   * Update a record in Supabase table with security checks
   */
  async update<T = any>(
    table: string,
    id: string,
    data: Record<string, any>,
    options: {
      userId?: string,
      returnData?: boolean,
      idField?: string
    } = {}
  ): Promise<T> {
    // Security checks
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    if (!isPayloadSafe(data)) {
      throw new Error('Payload too large');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`update:${table}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest('PATCH', `table/${table}/${id}`, data, options.userId);
      
      // Build the query
      const query = supabase
        .from(table as any)
        .update(data)
        .eq(options.idField || 'id', id);
      
      // Add user_id filter if provided for additional security
      const finalQuery = options.userId 
        ? query.eq('user_id', options.userId)
        : query;
      
      // Execute with timeout
      const result = await timeoutRequest(
        Promise.resolve(finalQuery.select(options.returnData ? '*' : undefined)),
        API_REQUEST_TIMEOUT,
        `update:${table}`
      );
      
      if (result.error) {
        throw result.error;
      }
      
      return (options.returnData ? result.data : { success: true }) as T;
    } catch (error) {
      return handleApiError(error, `update:${table}`);
    }
  },
  
  /**
   * Delete a record from Supabase table with security checks
   */
  async delete(
    table: string,
    id: string,
    options: {
      userId?: string,
      idField?: string
    } = {}
  ): Promise<{ success: boolean }> {
    // Security checks
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`delete:${table}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest('DELETE', `table/${table}/${id}`, undefined, options.userId);
      
      // Build the query
      const query = supabase
        .from(table as any)
        .delete()
        .eq(options.idField || 'id', id);
      
      // Add user_id filter if provided for additional security
      const finalQuery = options.userId 
        ? query.eq('user_id', options.userId)
        : query;
      
      // Execute with timeout
      const result = await timeoutRequest(
        Promise.resolve(finalQuery),
        API_REQUEST_TIMEOUT,
        `delete:${table}`
      );
      
      if (result.error) {
        throw result.error;
      }
      
      return { success: true };
    } catch (error) {
      return handleApiError(error, `delete:${table}`);
    }
  },
  
  /**
   * Execute a secure external API request
   */
  async request<T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      data?: any,
      headers?: Record<string, string>,
      userId?: string
    } = {}
  ): Promise<T> {
    // Security checks
    if (!isUrlSafe(url)) {
      throw new Error('URL not allowed');
    }
    
    if (options.data && !isPayloadSafe(options.data)) {
      throw new Error('Payload too large');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`external:${new URL(url).hostname}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest(options.method || 'GET', url, options.data, options.userId);
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      // Add body for non-GET requests
      if (options.data && options.method !== 'GET') {
        fetchOptions.body = JSON.stringify(options.data);
      }
      
      // Execute with timeout and rate limiting
      const response = await timeoutRequest(
        secureFetch(url, fetchOptions),
        API_REQUEST_TIMEOUT,
        url
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      return handleApiError(error, url);
    }
  },
  
  /**
   * Execute a Supabase function with security checks
   */
  async function<T = any>(
    functionName: string,
    data: any,
    options: {
      userId?: string
    } = {}
  ): Promise<T> {
    // Security checks
    if (!/^[a-zA-Z0-9-_]+$/.test(functionName)) {
      throw new Error('Invalid function name');
    }
    
    if (!isPayloadSafe(data)) {
      throw new Error('Payload too large');
    }
    
    // Track request for DDoS protection
    if (!requestTracker.track(`function:${functionName}`, options.userId || 'anonymous')) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request
      logApiRequest('POST', `function/${functionName}`, data, options.userId);
      
      // Execute with timeout
      const result = await timeoutRequest(
        Promise.resolve(supabase.functions.invoke(functionName, {
          body: data
        })),
        API_REQUEST_TIMEOUT,
        `function:${functionName}`
      );
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data as T;
    } catch (error) {
      return handleApiError(error, `function:${functionName}`);
    }
  },
  
  /**
   * Get current user with security checks
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return data.user;
    } catch (error) {
      return handleApiError(error, 'getCurrentUser', false);
    }
  },
  
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    // Track request for DDoS protection
    if (!requestTracker.track(`auth:signIn`, email)) {
      throw new Error('Too many requests');
    }
    
    try {
      // Log the request (without password)
      logApiRequest('POST', 'auth/signin', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      return handleApiError(error, 'signIn');
    }
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      // Log the request
      logApiRequest('POST', 'auth/signout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'signOut');
    }
  },
  
  /**
   * Reset request tracking (for testing)
   */
  _resetTracking() {
    if (process.env.NODE_ENV === 'development') {
      requestTracker.counts.clear();
      requestTracker.timestamps.clear();
      requestTracker.blockedIps.clear();
      requestTracker.lastReset = Date.now();
    }
  }
};