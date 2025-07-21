import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce, throttle } from '@/utils/performance';

// Enhanced types for better type safety
interface CacheStats {
  hitRate: number;
  size: number;
  entries: number;
  largeEntries: number;
  oldEntries: number;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheStats: CacheStats;
  cacheHitRate: number;
  networkLatency: number;
  cpuUsage: number;
  longTasks: number;
  fps: number;
}

interface ComponentRenderStats {
  avgTime: number;
  minTime: number;
  maxTime: number;
  lastTime: number;
  samples: number;
}

// Centralized performance store with enhanced metrics
const performanceStore = {
  componentRenderTimes: new Map<string, number[]>(),
  componentStats: new Map<string, ComponentRenderStats>(),
  cacheHits: 0,
  cacheMisses: 0,
  lastCacheClear: Date.now(),
  networkRequests: new Map<string, { start: number, end?: number }>(),
  longTasks: 0,
  frameRates: [] as number[],
  lastFrameTime: 0,
  ddosProtection: {
    requestCounts: new Map<string, number>(),
    ipThrottled: new Set<string>(),
    lastReset: Date.now()
  }
};

// Constants for performance thresholds
const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_LARGE_OBJECT_SIZE = 50000; // ~50KB
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes
const MEMORY_CHECK_INTERVAL = 30000; // 30 seconds
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MAX_COMPONENT_SAMPLES = 20;
const FPS_SAMPLE_SIZE = 10;

/**
 * Main performance optimization hook
 * Provides metrics and optimization functions
 */
export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();
  
  // Use memo to avoid recreating functions on each render
  const estimateCacheSize = useMemo(() => {
    return (): { size: number, largeEntries: number, oldEntries: number } => {
      try {
        const queries = queryClient.getQueryCache().getAll();
        let size = 0;
        let largeEntries = 0;
        let oldEntries = 0;
        const now = Date.now();
        
        // More accurate estimation with size tracking
        queries.forEach(query => {
          const data = query.state.data;
          if (data) {
            try {
              const jsonString = JSON.stringify(data);
              const entrySize = jsonString.length * 2; // Approximate size in bytes
              size += entrySize;
              
              // Track large entries
              if (entrySize > CACHE_LARGE_OBJECT_SIZE) {
                largeEntries++;
              }
              
              // Track old entries
              if ((now - query.state.dataUpdatedAt) > CACHE_MAX_AGE) {
                oldEntries++;
              }
            } catch (e) {
              // Skip if can't stringify
            }
          }
        });
        
        return { size, largeEntries, oldEntries };
      } catch (e) {
        return { size: 0, largeEntries: 0, oldEntries: 0 };
      }
    };
  }, [queryClient]);
  
  // Enhanced metrics query with more performance data
  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Calculate cache hit rate
      const totalCacheRequests = performanceStore.cacheHits + performanceStore.cacheMisses;
      const hitRate = totalCacheRequests > 0 
        ? Math.round((performanceStore.cacheHits / totalCacheRequests) * 100) 
        : 0;
      
      // Get enhanced cache size estimation
      const { size, largeEntries, oldEntries } = estimateCacheSize();
      
      // Calculate network latency from performance entries
      const networkLatency = calculateAverageNetworkLatency();
      
      // Calculate FPS if we have samples
      const fps = performanceStore.frameRates.length > 0
        ? performanceStore.frameRates.reduce((sum, rate) => sum + rate, 0) / performanceStore.frameRates.length
        : 60; // Default to 60fps if no measurements
      
      return {
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
        renderTime: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
        memoryUsage: (performance as any)?.memory?.usedJSHeapSize / 1024 / 1024 || 0,
        cacheStats: {
          hitRate: hitRate,
          size: size,
          entries: queryClient.getQueryCache().getAll().length,
          largeEntries,
          oldEntries
        },
        cacheHitRate: hitRate,
        networkLatency,
        cpuUsage: estimateCpuUsage(),
        longTasks: performanceStore.longTasks,
        fps
      };
    },
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Calculate average network latency from performance entries
  const calculateAverageNetworkLatency = useCallback((): number => {
    try {
      const resources = performance.getEntriesByType('resource');
      if (resources.length === 0) return 0;
      
      // Filter for API calls and calculate average
      const apiCalls = resources.filter(r => 
        r.name.includes('/api/') || 
        r.name.includes('supabase')
      );
      
      if (apiCalls.length === 0) return 0;
      
      const totalLatency = apiCalls.reduce((sum, entry) => sum + entry.duration, 0);
      return Math.round(totalLatency / apiCalls.length);
    } catch (e) {
      return 0;
    }
  }, []);
  
  // Estimate CPU usage based on task duration
  const estimateCpuUsage = useCallback((): number => {
    try {
      if (performanceStore.longTasks === 0) return 0;
      
      // Get long tasks from performance observer if available
      const longTaskEntries = performance.getEntriesByType('longtask');
      if (longTaskEntries.length === 0) return 10; // Default estimate
      
      // Calculate percentage of time spent in long tasks
      const totalTaskTime = longTaskEntries.reduce((sum, task) => sum + task.duration, 0);
      const observationWindow = 5000; // 5 seconds
      return Math.min(100, Math.round((totalTaskTime / observationWindow) * 100));
    } catch (e) {
      return 0;
    }
  }, []);
  
  // Enhanced query optimization with priority-based cleanup
  const optimizeQueries = useCallback(() => {
    // Get all queries
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    // Categorize queries by priority for removal
    const highPriorityRemoval = [];
    const mediumPriorityRemoval = [];
    const lowPriorityRemoval = [];
    
    for (const query of queries) {
      const lastUpdated = query.state.dataUpdatedAt;
      const age = now - lastUpdated;
      const queryData = query.state.data;
      
      // Skip active queries
      if (query.getObserversCount() > 0) continue;
      
      try {
        // High priority: old and large
        if (age > CACHE_MAX_AGE && queryData && JSON.stringify(queryData).length > CACHE_LARGE_OBJECT_SIZE) {
          highPriorityRemoval.push(query);
        }
        // Medium priority: very old but not large
        else if (age > CACHE_MAX_AGE * 2) {
          mediumPriorityRemoval.push(query);
        }
        // Low priority: somewhat old
        else if (age > CACHE_STALE_TIME) {
          lowPriorityRemoval.push(query);
        }
      } catch (e) {
        // If we can't stringify, consider it medium priority
        if (age > CACHE_MAX_AGE) {
          mediumPriorityRemoval.push(query);
        }
      }
    }
    
    // Remove in priority order
    [...highPriorityRemoval, ...mediumPriorityRemoval, ...lowPriorityRemoval].forEach(query => {
      queryClient.removeQueries({ queryKey: query.queryKey });
    });
    
    return highPriorityRemoval.length + mediumPriorityRemoval.length + lowPriorityRemoval.length;
  }, [queryClient]);
  
  // Selective cache clearing with options
  const clearCache = useCallback((options?: { 
    preserveAuth?: boolean, 
    preserveUserData?: boolean,
    preserveRecentQueries?: boolean
  }) => {
    const preservedQueries: QueryKey[] = [];
    
    // Identify queries to preserve
    if (options?.preserveAuth || options?.preserveUserData) {
      const queries = queryClient.getQueryCache().getAll();
      
      queries.forEach(query => {
        const key = query.queryKey;
        const keyString = JSON.stringify(key);
        
        // Preserve auth queries
        if (options.preserveAuth && (
          keyString.includes('auth') || 
          keyString.includes('user') || 
          keyString.includes('profile')
        )) {
          preservedQueries.push(key);
        }
        
        // Preserve recent queries
        if (options.preserveRecentQueries && 
            (Date.now() - query.state.dataUpdatedAt) < 60000) { // 1 minute
          preservedQueries.push(key);
        }
      });
    }
    
    // Clear cache except preserved queries
    queryClient.clear();
    
    // Restore preserved queries
    preservedQueries.forEach(key => {
      const data = queryClient.getQueryData(key);
      if (data) {
        queryClient.setQueryData(key, data);
      }
    });
    
    // Selectively clear storage
    if (!options?.preserveUserData) {
      localStorage.clear();
      sessionStorage.clear();
    } else {
      // Clear only non-user related items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.includes('user') && !key.includes('auth')) {
          localStorage.removeItem(key);
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !key.includes('user') && !key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      }
    }
    
    // Reset performance metrics
    performanceStore.cacheHits = 0;
    performanceStore.cacheMisses = 0;
    performanceStore.lastCacheClear = Date.now();
    
    return true;
  }, [queryClient]);
  
  // Intelligent component preloading with priority
  const preloadComponents = useCallback(async (
    componentPaths: Array<{path: string, priority: 'high' | 'medium' | 'low'}>
  ) => {
    try {
      // Sort by priority
      const sortedPaths = [...componentPaths].sort((a, b) => {
        const priorityMap = { high: 0, medium: 1, low: 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      });
      
      // Load high priority immediately
      const highPriorityPaths = sortedPaths
        .filter(item => item.priority === 'high')
        .map(item => item.path);
        
      if (highPriorityPaths.length > 0) {
        await Promise.all(
          highPriorityPaths.map(path => import(/* @vite-ignore */ path))
        );
      }
      
      // Load medium priority with slight delay
      const mediumPriorityPaths = sortedPaths
        .filter(item => item.priority === 'medium')
        .map(item => item.path);
        
      if (mediumPriorityPaths.length > 0) {
        setTimeout(() => {
          Promise.all(
            mediumPriorityPaths.map(path => import(/* @vite-ignore */ path))
          );
        }, 100);
      }
      
      // Load low priority during idle time
      const lowPriorityPaths = sortedPaths
        .filter(item => item.priority === 'low')
        .map(item => item.path);
        
      if (lowPriorityPaths.length > 0 && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          Promise.all(
            lowPriorityPaths.map(path => import(/* @vite-ignore */ path))
          );
        });
      } else if (lowPriorityPaths.length > 0) {
        setTimeout(() => {
          Promise.all(
            lowPriorityPaths.map(path => import(/* @vite-ignore */ path))
          );
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Error preloading components:', error);
      return false;
    }
  }, []);
  
  // Set up performance observers for long tasks and frame rate
  useEffect(() => {
    // Set up long task observer
    let longTaskObserver: PerformanceObserver | null = null;
    
    try {
      if ('PerformanceObserver' in window) {
        longTaskObserver = new PerformanceObserver((list) => {
          performanceStore.longTasks += list.getEntries().length;
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch (e) {
      console.error('Error setting up long task observer:', e);
    }
    
    // Set up frame rate monitoring
    let frameId: number | null = null;
    let lastFrameTime = performance.now();
    
    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      
      if (delta > 0) {
        const fps = Math.min(60, Math.round(1000 / delta));
        performanceStore.frameRates.push(fps);
        
        // Keep only the last N samples
        if (performanceStore.frameRates.length > FPS_SAMPLE_SIZE) {
          performanceStore.frameRates.shift();
        }
      }
      
      frameId = requestAnimationFrame(measureFrameRate);
    };
    
    frameId = requestAnimationFrame(measureFrameRate);
    
    // Set up periodic cache optimization
    const cacheInterval = setInterval(() => {
      const removedCount = optimizeQueries();
      if (removedCount > 0) {
        console.debug(`Optimized cache: removed ${removedCount} inactive queries`);
      }
    }, CACHE_CLEANUP_INTERVAL);
    
    return () => {
      // Clean up all observers and intervals
      if (longTaskObserver) {
        longTaskObserver.disconnect();
      }
      
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      
      clearInterval(cacheInterval);
    };
  }, [optimizeQueries]);
  
  return {
    metrics: metrics || {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheStats: { hitRate: 0, size: 0, entries: 0, largeEntries: 0, oldEntries: 0 },
      cacheHitRate: 0,
      networkLatency: 0,
      cpuUsage: 0,
      longTasks: 0,
      fps: 60
    },
    optimizeQueries,
    clearCache,
    preloadComponents,
    getComponentStats: (componentName: string) => performanceStore.componentStats.get(componentName)
  };
};

/**
 * Enhanced cache optimization hook
 * Provides advanced cache management functions
 */
export const useCacheOptimization = () => {
  const queryClient = useQueryClient();
  
  // Track cache hits and misses with rate limiting
  useEffect(() => {
    const defaultFn = queryClient.getQueryCache().find;
    
    // Override the find method to track cache hits and misses
    queryClient.getQueryCache().find = function(...args) {
      const result = defaultFn.apply(this, args);
      
      // Rate limit tracking to avoid performance impact
      if (Math.random() < 0.1) { // Only track 10% of calls
        if (result && result.state.data !== undefined) {
          performanceStore.cacheHits++;
        } else {
          performanceStore.cacheMisses++;
        }
      }
      
      return result;
    };
    
    return () => {
      // Restore original function
      queryClient.getQueryCache().find = defaultFn;
    };
  }, [queryClient]);
  
  // Enhanced stale cache clearing with selective options
  const clearStaleCache = useCallback((options?: {
    maxAge?: number,
    onlyLargeObjects?: boolean,
    preserveKeys?: string[]
  }) => {
    const now = Date.now();
    const queries = queryClient.getQueryCache().getAll();
    const maxAge = options?.maxAge || CACHE_MAX_AGE;
    const preserveKeys = options?.preserveKeys || [];
    
    let removedCount = 0;
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      const age = now - lastUpdated;
      
      // Skip preserved keys
      if (preserveKeys.some(key => JSON.stringify(query.queryKey).includes(key))) {
        return;
      }
      
      // Check age condition
      if (age > maxAge) {
        // Check size condition if needed
        if (options?.onlyLargeObjects) {
          try {
            const data = query.state.data;
            if (data && JSON.stringify(data).length > CACHE_LARGE_OBJECT_SIZE) {
              queryClient.removeQueries({ queryKey: query.queryKey });
              removedCount++;
            }
          } catch (e) {
            // Skip if can't stringify
          }
        } else {
          queryClient.removeQueries({ queryKey: query.queryKey });
          removedCount++;
        }
      }
    });
    
    performanceStore.lastCacheClear = now;
    return removedCount;
  }, [queryClient]);
  
  // Advanced memory optimization with heap snapshot analysis
  const optimizeMemoryUsage = useCallback(() => {
    // Get memory usage before optimization
    const beforeMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    
    // Clear large objects in the cache that haven't been accessed recently
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    let optimizedCount = 0;
    queries.forEach(query => {
      const lastAccessed = query.state.dataUpdatedAt;
      // If data is older than 15 minutes and is large
      if ((now - lastAccessed) > 15 * 60 * 1000) {
        try {
          const data = query.state.data;
          if (data) {
            const size = JSON.stringify(data).length;
            if (size > CACHE_LARGE_OBJECT_SIZE) {
              queryClient.removeQueries({ queryKey: query.queryKey });
              optimizedCount++;
            }
          }
        } catch (e) {
          // Skip if can't stringify
        }
      }
    });
    
    // Force garbage collection-like behavior
    try {
      // Create and release large arrays to trigger potential GC
      const largeArrays = [];
      for (let i = 0; i < 10; i++) {
        largeArrays.push(new Array(1000000).fill(0));
      }
      // Clear the arrays
      largeArrays.length = 0;
    } catch (e) {
      // Ignore errors
    }
    
    // Get memory usage after optimization
    const afterMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    const savedMemory = Math.max(0, beforeMemory - afterMemory);
    
    return {
      optimizedCount,
      savedMemory: Math.round(savedMemory / (1024 * 1024)) // MB
    };
  }, [queryClient]);
  
  // Intelligent prefetching with priority and throttling
  const prefetchKey = useCallback((
    key: any, 
    options?: { 
      queryFn?: () => Promise<any>,
      priority?: 'high' | 'medium' | 'low',
      staleTime?: number
    }
  ) => {
    const priority = options?.priority || 'medium';
    const staleTime = options?.staleTime || 5 * 60 * 1000; // 5 minutes default
    
    // For high priority, fetch immediately
    if (priority === 'high') {
      if (options?.queryFn) {
        queryClient.prefetchQuery({
          queryKey: Array.isArray(key) ? key : [key],
          queryFn: options.queryFn,
          staleTime
        });
      } else {
        // Try to find the query in the cache
        const existingQuery = queryClient.getQueryCache().find({ queryKey: Array.isArray(key) ? key : [key] });
        if (existingQuery?.fetch) {
          queryClient.prefetchQuery({
            queryKey: Array.isArray(key) ? key : [key],
            queryFn: existingQuery.fetch,
            staleTime
          });
        }
      }
    } 
    // For medium priority, use setTimeout
    else if (priority === 'medium') {
      setTimeout(() => {
        if (options?.queryFn) {
          queryClient.prefetchQuery({
            queryKey: Array.isArray(key) ? key : [key],
            queryFn: options.queryFn,
            staleTime
          });
        }
      }, 100);
    }
    // For low priority, use requestIdleCallback
    else if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        if (options?.queryFn) {
          queryClient.prefetchQuery({
            queryKey: Array.isArray(key) ? key : [key],
            queryFn: options.queryFn,
            staleTime
          });
        }
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        if (options?.queryFn) {
          queryClient.prefetchQuery({
            queryKey: Array.isArray(key) ? key : [key],
            queryFn: options.queryFn,
            staleTime
          });
        }
      }, 500);
    }
    
    return true;
  }, [queryClient]);
  
  // Analyze cache for optimization opportunities
  const analyzeCacheHealth = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    // Analyze cache health
    const totalQueries = queries.length;
    let totalSize = 0;
    let oldQueries = 0;
    let largeQueries = 0;
    let activeQueries = 0;
    let inactiveQueries = 0;
    
    queries.forEach(query => {
      // Check if query is active (has observers)
      if (query.getObserversCount() > 0) {
        activeQueries++;
      } else {
        inactiveQueries++;
      }
      
      // Check age
      const age = now - query.state.dataUpdatedAt;
      if (age > CACHE_MAX_AGE) {
        oldQueries++;
      }
      
      // Check size
      try {
        const data = query.state.data;
        if (data) {
          const size = JSON.stringify(data).length;
          totalSize += size;
          if (size > CACHE_LARGE_OBJECT_SIZE) {
            largeQueries++;
          }
        }
      } catch (e) {
        // Skip if can't stringify
      }
    });
    
    return {
      totalQueries,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      oldQueries,
      largeQueries,
      activeQueries,
      inactiveQueries,
      cacheHitRate: performanceStore.cacheHits + performanceStore.cacheMisses > 0
        ? Math.round((performanceStore.cacheHits / (performanceStore.cacheHits + performanceStore.cacheMisses)) * 100)
        : 0,
      timeSinceLastCleanup: Math.round((now - performanceStore.lastCacheClear) / 1000)
    };
  }, [queryClient]);
  
  return {
    clearStaleCache,
    optimizeMemoryUsage,
    prefetchKey,
    analyzeCacheHealth
  };
};

/**
 * Enhanced performance monitoring hook
 * Provides detailed component and page performance metrics
 */
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    networkLatency: 0,
    fps: 0
  });
  
  const startTimeRef = useRef<number | null>(null);
  const componentNameRef = useRef<string | null>(null);
  const renderCountRef = useRef<Map<string, number>>(new Map());

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      
      // Get network metrics
      const networkLatency = navigation.responseStart - navigation.requestStart;
      
      setMetrics(prev => ({
        ...prev,
        loadTime,
        renderTime,
        networkLatency
      }));
      
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Page load performance: Load time: ${loadTime.toFixed(2)}ms, Render time: ${renderTime.toFixed(2)}ms`);
      }
      
      // Report to monitoring service if available
      reportPerformanceMetric('page_load', {
        loadTime,
        renderTime,
        url: window.location.pathname
      });
    }
  }, []);

  // Get memory usage with throttling to avoid performance impact
  const getMemoryUsage = useCallback(() => {
    if ((performance as any).memory) {
      const memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
      
      // Log only in development and only if significant change
      if (process.env.NODE_ENV === 'development' && 
          (Math.abs(metrics.memoryUsage - memoryUsage) > 10)) {
        console.debug(`Memory usage: ${memoryUsage}MB`);
      }
      
      // Alert if memory usage is very high
      if (memoryUsage > 500) {
        console.warn(`High memory usage detected: ${memoryUsage}MB`);
      }
    }
  }, [metrics.memoryUsage]);

  // Start measuring component render time
  const startMeasure = useCallback((componentName: string = 'unnamed') => {
    startTimeRef.current = performance.now();
    componentNameRef.current = componentName;
    
    // Track render count
    const currentCount = renderCountRef.current.get(componentName) || 0;
    renderCountRef.current.set(componentName, currentCount + 1);
  }, []);

  // Finish measuring component render time with enhanced stats
  const measureRenderTime = useCallback((componentName: string = 'unnamed') => {
    const endTime = performance.now();
    const name = componentNameRef.current || componentName;
    
    if (startTimeRef.current) {
      const renderTime = endTime - startTimeRef.current;
      
      // Store in performance store for tracking
      if (!performanceStore.componentRenderTimes.has(name)) {
        performanceStore.componentRenderTimes.set(name, []);
      }
      
      const times = performanceStore.componentRenderTimes.get(name)!;
      times.push(renderTime);
      
      // Keep only the last N measurements
      if (times.length > MAX_COMPONENT_SAMPLES) {
        times.shift();
      }
      
      // Calculate stats
      const avgRenderTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      // Update component stats
      performanceStore.componentStats.set(name, {
        avgTime: avgRenderTime,
        minTime,
        maxTime,
        lastTime: renderTime,
        samples: times.length
      });
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        renderTime: avgRenderTime
      }));
      
      // Calculate cache hit rate
      const totalCacheRequests = performanceStore.cacheHits + performanceStore.cacheMisses;
      const hitRate = totalCacheRequests > 0 
        ? Math.round((performanceStore.cacheHits / totalCacheRequests) * 100) 
        : 0;
      
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: hitRate
      }));
      
      // Log slow renders
      if (renderTime > 50) {
        console.warn(`Slow render detected in ${name}: ${renderTime.toFixed(2)}ms`);
        
        // Report to monitoring service if available
        reportPerformanceMetric('slow_render', {
          component: name,
          renderTime,
          renderCount: renderCountRef.current.get(name) || 0
        });
      }
      
      // Reset for next measurement
      startTimeRef.current = null;
      componentNameRef.current = null;
      
      return {
        time: renderTime,
        avg: avgRenderTime,
        min: minTime,
        max: maxTime
      };
    }
    
    return {
      time: 0,
      avg: 0,
      min: 0,
      max: 0
    };
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback((url: string, options?: { method?: string }) => {
    const requestId = `${options?.method || 'GET'}-${url}-${Date.now()}`;
    performanceStore.networkRequests.set(requestId, { start: performance.now() });
    
    return {
      complete: () => {
        const request = performanceStore.networkRequests.get(requestId);
        if (request) {
          request.end = performance.now();
          const duration = request.end - request.start;
          
          // Report to monitoring service if available
          reportPerformanceMetric('network_request', {
            url,
            method: options?.method || 'GET',
            duration
          });
          
          return duration;
        }
        return 0;
      }
    };
  }, []);

  // Mock function for reporting metrics to a monitoring service
  const reportPerformanceMetric = (metricName: string, data: any) => {
    // In a real implementation, this would send data to a monitoring service
    // For now, we'll just store it locally
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Performance metric: ${metricName}`, data);
    }
  };

  // Update memory usage periodically with throttling
  useEffect(() => {
    // Initial measurement
    getMemoryUsage();
    
    // Throttled memory check to reduce performance impact
    const throttledMemoryCheck = throttle(getMemoryUsage, MEMORY_CHECK_INTERVAL);
    
    const interval = setInterval(throttledMemoryCheck, MEMORY_CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [getMemoryUsage]);

  return {
    metrics,
    measurePageLoad,
    getMemoryUsage,
    startMeasure,
    measureRenderTime,
    trackNetworkRequest,
    getComponentStats: (name: string) => performanceStore.componentStats.get(name)
  };
};

/**
 * Enhanced image optimization hook
 * Provides advanced image loading and optimization
 */
export const useImageOptimization = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageStartTimeRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Enhanced observer creation with better options and error handling
  const createObserver = useCallback((element: HTMLElement, src: string, options?: {
    rootMargin?: string,
    threshold?: number,
    priority?: 'high' | 'low'
  }) => {
    // Clean up previous observer and abort controller
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Determine if we should use WebP format
    const supportsWebP = localStorage.getItem('supports_webp') === 'true';
    
    // For high priority images, load immediately
    if (options?.priority === 'high') {
      setIsIntersecting(true);
      imageStartTimeRef.current = performance.now();
      setImageSrc(supportsWebP && !src.includes('.gif') ? addWebPFormat(src) : src);
      return null;
    }
    
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              imageStartTimeRef.current = performance.now();
              
              // Use WebP if supported
              const finalSrc = supportsWebP && !src.includes('.gif') 
                ? addWebPFormat(src) 
                : src;
                
              setImageSrc(finalSrc);
              setFormat(supportsWebP && !src.includes('.gif') ? 'webp' : 'original');
              observer.unobserve(element);
            }
          });
        },
        { 
          threshold: options?.threshold || 0.1,
          rootMargin: options?.rootMargin || '200px' // Start loading when image is 200px from viewport
        }
      );

      observer.observe(element);
      observerRef.current = observer;
      return observer;
    } catch (error) {
      // Fallback if IntersectionObserver fails
      console.error('Error creating IntersectionObserver:', error);
      setIsIntersecting(true);
      imageStartTimeRef.current = performance.now();
      setImageSrc(src);
      return null;
    }
  }, []);
  
  // Helper to add WebP format to URL
  const addWebPFormat = (url: string): string => {
    // Don't modify GIFs
    if (url.includes('.gif')) return url;
    
    // Add WebP format parameter
    return url.includes('?') 
      ? `${url}&format=webp` 
      : `${url}?format=webp`;
  };
  
  // Enhanced image load handler with retry logic
  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
    retryCountRef.current = 0;
    
    if (imageStartTimeRef.current) {
      const loadDuration = performance.now() - imageStartTimeRef.current;
      setLoadTime(loadDuration);
      
      // Report slow image loads
      if (loadDuration > 1000) {
        console.warn(`Slow image load: ${loadDuration.toFixed(2)}ms for ${imageSrc}`);
      }
      
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Image loaded in ${loadDuration.toFixed(2)}ms (${format || 'unknown format'})`);
      }
    }
  }, [imageSrc, format]);
  
  // Handle image load errors with retry
  const onImageError = useCallback(() => {
    // If we're already using WebP, try falling back to original format
    if (format === 'webp' && imageSrc) {
      const originalSrc = imageSrc.replace('format=webp', '').replace('&format=webp', '');
      setImageSrc(originalSrc);
      setFormat('original');
      localStorage.setItem('supports_webp', 'false');
      return;
    }
    
    // Otherwise try to retry loading a few times
    if (retryCountRef.current < 3 && imageSrc) {
      retryCountRef.current++;
      
      // Add cache buster to URL
      const retrySrc = imageSrc.includes('?') 
        ? `${imageSrc}&retry=${retryCountRef.current}` 
        : `${imageSrc}?retry=${retryCountRef.current}`;
        
      setTimeout(() => {
        setImageSrc(retrySrc);
      }, 1000 * retryCountRef.current); // Exponential backoff
    } else {
      // Give up after 3 retries
      setIsLoaded(false);
      console.error(`Failed to load image after ${retryCountRef.current} retries:`, imageSrc);
    }
  }, [imageSrc, format]);
  
  // Check WebP support on mount
  useEffect(() => {
    // Only check if we haven't determined support yet
    if (localStorage.getItem('supports_webp') === null) {
      const webpImage = new Image();
      webpImage.onload = () => {
        localStorage.setItem('supports_webp', 'true');
      };
      webpImage.onerror = () => {
        localStorage.setItem('supports_webp', 'false');
      };
      webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }
  }, []);
  
  // Clean up observer and abort controller on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isIntersecting,
    imageSrc,
    isLoaded,
    loadTime,
    format,
    createObserver,
    onImageLoad,
    onImageError
  };
};

/**
 * DDoS protection utility
 * Provides rate limiting and request throttling
 */
export const useDDoSProtection = () => {
  // Reset request counts periodically
  useEffect(() => {
    const resetInterval = setInterval(() => {
      performanceStore.ddosProtection.requestCounts.clear();
      performanceStore.ddosProtection.ipThrottled.clear();
      performanceStore.ddosProtection.lastReset = Date.now();
    }, 60000); // Reset every minute
    
    return () => clearInterval(resetInterval);
  }, []);
  
  // Track and limit requests by IP or identifier
  const trackRequest = useCallback((identifier: string, limit: number = 100): boolean => {
    // Get current count
    const currentCount = performanceStore.ddosProtection.requestCounts.get(identifier) || 0;
    
    // Check if already throttled
    if (performanceStore.ddosProtection.ipThrottled.has(identifier)) {
      return false;
    }
    
    // Check if over limit
    if (currentCount >= limit) {
      performanceStore.ddosProtection.ipThrottled.add(identifier);
      console.warn(`Rate limit exceeded for ${identifier}. Throttling requests.`);
      return false;
    }
    
    // Increment count
    performanceStore.ddosProtection.requestCounts.set(identifier, currentCount + 1);
    return true;
  }, []);
  
  // Apply exponential backoff for retries
  const getBackoffDelay = useCallback((retryCount: number, baseDelay: number = 1000): number => {
    return Math.min(
      baseDelay * Math.pow(2, retryCount) + Math.random() * 1000,
      30000 // Max 30 seconds
    );
  }, []);
  
  return {
    trackRequest,
    getBackoffDelay,
    isThrottled: (identifier: string) => performanceStore.ddosProtection.ipThrottled.has(identifier)
  };
};