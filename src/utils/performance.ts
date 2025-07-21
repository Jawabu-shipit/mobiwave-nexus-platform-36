/**
 * Performance utility functions
 * Provides debounce, throttle, and other performance-related utilities
 */

// Add WeakRef type declaration if it's not available in the current TypeScript version
declare global {
  interface Window {
    WeakRef?: typeof WeakRef;
  }
  
  // Ensure WeakRef is defined for TypeScript
  interface WeakRef<T extends object> {
    deref(): T | undefined;
  }
  
  interface WeakRefConstructor {
    new <T extends object>(target: T): WeakRef<T>;
    readonly prototype: WeakRef<any>;
  }
  
  var WeakRef: WeakRefConstructor;
}

/**
 * Debounces a function to limit how often it can be called
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @param immediate Whether to call the function immediately
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Throttles a function to limit how often it can be called
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Measures the execution time of a function
 * @param func The function to measure
 * @param label A label for the measurement
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  func: T,
  label: string = 'Function execution'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    
    console.debug(`${label}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

/**
 * Creates a memoized version of a function
 * @param func The function to memoize
 * @param resolver Optional function to resolve the cache key
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Limits the rate of function calls and batches them together
 * @param func The function to batch
 * @param wait The time to wait in milliseconds
 */
export function batchCalls<T extends (...args: any[]) => any>(
  func: (items: Parameters<T>[]) => void,
  wait: number
): (...args: Parameters<T>) => void {
  let batch: Parameters<T>[] = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    batch.push(args);
    
    if (!timeout) {
      timeout = setTimeout(() => {
        func(batch);
        batch = [];
        timeout = null;
      }, wait);
    }
  };
}

/**
 * Measures memory usage before and after a function call
 * @param func The function to measure
 * @param label A label for the measurement
 */
export function measureMemoryUsage<T extends (...args: any[]) => any>(
  func: T,
  label: string = 'Memory usage'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    // Only works in Chrome
    const memoryBefore = (performance as any).memory?.usedJSHeapSize;
    const result = func.apply(this, args);
    const memoryAfter = (performance as any).memory?.usedJSHeapSize;
    
    if (memoryBefore && memoryAfter) {
      const diff = (memoryAfter - memoryBefore) / (1024 * 1024);
      console.debug(`${label}: ${diff.toFixed(2)}MB`);
    }
    
    return result;
  };
}

/**
 * Runs a function only when the browser is idle
 * @param func The function to run
 * @param timeout Maximum time to wait before forcing execution
 */
export function runWhenIdle<T extends (...args: any[]) => any>(
  func: T,
  timeout: number = 2000
): (...args: Parameters<T>) => void {
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(
        () => {
          func.apply(context, args);
        },
        { timeout }
      );
    } else {
      setTimeout(() => {
        func.apply(context, args);
      }, 1);
    }
  };
}

/**
 * Limits the number of times a function can be called
 * @param func The function to limit
 * @param maxCalls Maximum number of calls allowed
 */
export function limitCalls<T extends (...args: any[]) => any>(
  func: T,
  maxCalls: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let callCount = 0;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (callCount < maxCalls) {
      callCount++;
      return func.apply(this, args);
    }
    
    console.warn(`Function call limit (${maxCalls}) exceeded`);
    return undefined;
  };
}

/**
 * Measures and reports network request performance
 * @param url The URL to fetch
 * @param options Fetch options
 */
export async function measureNetworkRequest<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; metrics: { duration: number; size: number } }> {
  const start = performance.now();
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  const end = performance.now();
  const duration = end - start;
  
  // Get response size
  const size = parseInt(response.headers.get('content-length') || '0', 10) || 
               new TextEncoder().encode(JSON.stringify(data)).length;
  
  // Log performance data
  console.debug(`Network request to ${url}: ${duration.toFixed(2)}ms, ${(size / 1024).toFixed(2)}KB`);
  
  return {
    data,
    metrics: {
      duration,
      size
    }
  };
}

/**
 * Creates a rate-limited fetch function to prevent API abuse
 * @param limit Number of requests allowed per interval
 * @param interval Time interval in milliseconds
 */
export function createRateLimitedFetch(
  limit: number = 10,
  interval: number = 1000
): typeof fetch {
  let requestCount = 0;
  let resetTimeout: ReturnType<typeof setTimeout>;
  
  // Reset counter after interval
  const resetCounter = () => {
    requestCount = 0;
    resetTimeout = setTimeout(resetCounter, interval);
  };
  
  // Start the reset cycle
  resetTimeout = setTimeout(resetCounter, interval);
  
  return async function rateLimitedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Check if we've hit the limit
    if (requestCount >= limit) {
      console.warn(`Rate limit of ${limit} requests per ${interval}ms exceeded`);
      
      // Wait until the next interval
      await new Promise(resolve => {
        setTimeout(resolve, interval - (Date.now() % interval));
      });
      
      // Try again
      return rateLimitedFetch(input, init);
    }
    
    // Increment counter and make the request
    requestCount++;
    return fetch(input, init);
  };
}

/**
 * Detects slow renders and reports them
 * @param threshold Time threshold in milliseconds
 */
export function detectSlowRenders(threshold: number = 16): void {
  let lastFrameTime = performance.now();
  
  function checkFrameTime() {
    const now = performance.now();
    const frameDuration = now - lastFrameTime;
    
    if (frameDuration > threshold) {
      console.warn(`Slow render detected: ${frameDuration.toFixed(2)}ms (threshold: ${threshold}ms)`);
      
      // Get the component stack if possible
      try {
        throw new Error('Slow render stack trace');
      } catch (e) {
        console.debug('Render occurred at:', e);
      }
    }
    
    lastFrameTime = now;
    requestAnimationFrame(checkFrameTime);
  }
  
  requestAnimationFrame(checkFrameTime);
}

/**
 * Detects memory leaks by tracking object references
 * @param object The object to track
 * @param label A label for the object
 */
export function trackObjectReference(object: any, label: string): void {
  // Use a WeakRef to track the object without preventing garbage collection
  if (typeof WeakRef !== 'undefined') {
    const ref = new WeakRef(object);
    const startTime = Date.now();
    
    // Check if the object is still in memory periodically
    const checkInterval = setInterval(() => {
      const obj = ref.deref();
      
      if (obj) {
        console.debug(`Object "${label}" is still in memory after ${Math.round((Date.now() - startTime) / 1000)}s`);
      } else {
        console.debug(`Object "${label}" has been garbage collected`);
        clearInterval(checkInterval);
      }
    }, 10000); // Check every 10 seconds
  } else {
    console.warn('WeakRef is not supported in this environment. Memory leak detection is disabled.');
  }
}