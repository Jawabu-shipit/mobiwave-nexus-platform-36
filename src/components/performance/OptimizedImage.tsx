
import React, { useState, useRef, useEffect } from 'react';
import { useImageOptimization } from '@/hooks/usePerformanceOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: number;
  sizes?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiNjY2MiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  quality = 75,
  sizes,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { isIntersecting, imageSrc, createObserver } = useImageOptimization();

  useEffect(() => {
    if (imgRef.current && !priority) {
      const observer = createObserver(imgRef.current, src);
      return () => observer?.disconnect();
    } else if (priority) {
      // Load immediately for priority images
      setIsLoaded(true);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const shouldShowImage = priority || isIntersecting || imageSrc;
  const displaySrc = shouldShowImage ? src : placeholder;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-70'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {!isLoaded && !hasError && shouldShowImage && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
