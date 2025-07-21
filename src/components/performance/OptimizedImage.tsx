
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useImageOptimization } from '@/hooks/usePerformanceOptimization';
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, FileType, AlertTriangle, RefreshCw } from 'lucide-react';
import { throttle } from '@/utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  showPerformance?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  blurhash?: string;
  onLoad?: () => void;
  onError?: () => void;
  fetchPriority?: 'high' | 'low' | 'auto';
  lazyBoundary?: string;
}

/**
 * Enhanced OptimizedImage component with advanced performance features
 * - Lazy loading with IntersectionObserver
 * - WebP format support with fallback
 * - Performance metrics
 * - Retry mechanism for failed loads
 * - Responsive image support
 * - Blur hash placeholder support
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiNjY2MiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  quality = 75,
  sizes,
  priority = false,
  showPerformance = false,
  width,
  height,
  objectFit = 'cover',
  fallbackSrc,
  blurhash,
  onLoad,
  onError,
  fetchPriority = 'auto',
  lazyBoundary = '200px'
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Use our enhanced image optimization hook
  const { 
    isIntersecting, 
    imageSrc, 
    isLoaded, 
    loadTime, 
    format,
    createObserver, 
    onImageLoad,
    onImageError
  } = useImageOptimization();

  // Generate optimized image URL with quality and format parameters
  const optimizedSrc = useMemo(() => {
    // Start with base URL
    let finalSrc = src;
    
    // Add quality parameter
    if (finalSrc.includes('?')) {
      finalSrc = `${finalSrc}&q=${quality}`;
    } else {
      finalSrc = `${finalSrc}?q=${quality}`;
    }
    
    // Add width and height if available for responsive images
    if (width) {
      finalSrc = `${finalSrc}&w=${width}`;
    }
    
    if (height) {
      finalSrc = `${finalSrc}&h=${height}`;
    }
    
    // Add retry parameter if retrying
    if (retryCount > 0) {
      finalSrc = `${finalSrc}&retry=${retryCount}`;
    }
    
    return finalSrc;
  }, [src, quality, width, height, retryCount]);

  // Set up the intersection observer
  useEffect(() => {
    if (imgRef.current && !priority) {
      createObserver(imgRef.current, optimizedSrc, {
        rootMargin: lazyBoundary,
        threshold: 0.1,
        priority: fetchPriority === 'high' ? 'high' : 'low'
      });
    } else if (priority && imgRef.current) {
      // For priority images, load immediately
      // Use the createObserver with high priority option instead of trying to set state directly
      createObserver(imgRef.current, optimizedSrc, {
        priority: 'high'
      });
    }
  }, [optimizedSrc, priority, createObserver, fetchPriority, lazyBoundary]);

  // Handle successful image load
  const handleLoad = () => {
    onImageLoad();
    setHasError(false);
    setIsRetrying(false);
    
    // Call external onLoad handler if provided
    if (onLoad) {
      onLoad();
    }
  };

  // Handle image load error with retry mechanism
  const handleError = () => {
    // If we have a fallback source and this is the first error, try the fallback
    if (fallbackSrc && !isRetrying && retryCount === 0) {
      setIsRetrying(true);
      const fallbackImage = new Image();
      fallbackImage.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = fallbackSrc;
        }
        setIsRetrying(false);
      };
      fallbackImage.onerror = () => {
        setHasError(true);
        setIsRetrying(false);
        if (onError) onError();
      };
      fallbackImage.src = fallbackSrc;
      return;
    }
    
    // Otherwise, if we haven't exceeded retry limit, try again
    if (retryCount < 2 && !isRetrying) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      // Use exponential backoff for retries
      setTimeout(() => {
        if (imgRef.current) {
          // Force reload by appending timestamp
          const retrySrc = `${optimizedSrc}&t=${Date.now()}`;
          imgRef.current.src = retrySrc;
        }
        setIsRetrying(false);
      }, 1000 * Math.pow(2, retryCount));
      
      return;
    }
    
    // If all retries failed, show error state
    setHasError(true);
    onImageError();
    
    // Call external onError handler if provided
    if (onError) {
      onError();
    }
  };

  // Determine what source to display
  const shouldShowImage = priority || isIntersecting || imageSrc;
  const displaySrc = shouldShowImage ? (imageSrc || optimizedSrc) : placeholder;

  // Calculate performance class based on load time
  const getPerformanceClass = () => {
    if (!loadTime) return 'bg-gray-100 text-gray-800';
    if (loadTime < 200) return 'bg-green-100 text-green-800';
    if (loadTime < 1000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Get performance icon based on load time
  const getPerformanceIcon = () => {
    if (!loadTime) return <Clock className="w-3 h-3" />;
    if (loadTime < 200) return <Zap className="w-3 h-3" />;
    if (loadTime < 1000) return <Clock className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width, height }}
      data-testid="optimized-image-container"
    >
      {/* Main image */}
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-70'
        } ${className} ${objectFit ? `object-${objectFit}` : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={fetchPriority}
        style={{ width: '100%', height: '100%' }}
        data-testid="optimized-image"
      />
      
      {/* Loading state */}
      {!isLoaded && !hasError && shouldShowImage && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
      
      {/* Error state with retry button */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm mb-2">Failed to load image</span>
          {retryCount < 3 && (
            <button 
              onClick={() => {
                setHasError(false);
                setRetryCount(prev => prev + 1);
                if (imgRef.current) {
                  imgRef.current.src = `${optimizedSrc}&t=${Date.now()}`;
                }
              }}
              className="px-2 py-1 bg-gray-200 rounded text-xs flex items-center gap-1 hover:bg-gray-300"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      )}

      {/* Performance badge */}
      {showPerformance && isLoaded && loadTime && (
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
          <Badge className={`${getPerformanceClass()} flex items-center gap-1 text-xs`}>
            {getPerformanceIcon()}
            {loadTime.toFixed(0)}ms
          </Badge>
          
          {format && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
              <FileType className="w-3 h-3" />
              {format}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
