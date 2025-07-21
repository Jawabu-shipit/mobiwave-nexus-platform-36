import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage component
 * 
 * A performance-optimized image component that:
 * - Supports WebP format with fallback
 * - Uses native lazy loading
 * - Implements responsive sizing
 * - Handles errors gracefully
 * - Supports blur-up loading effect
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  webpSrc,
  fallbackSrc,
  width,
  height,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Check if WebP is supported
  const [supportsWebP, setSupportsWebP] = useState(false);
  
  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = async () => {
      try {
        const webPCheck = document.createElement('canvas');
        if (webPCheck.getContext && webPCheck.getContext('2d')) {
          const isSupported = webPCheck.toDataURL('image/webp').indexOf('data:image/webp') === 0;
          setSupportsWebP(isSupported);
        } else {
          setSupportsWebP(false);
        }
      } catch (e) {
        setSupportsWebP(false);
      }
    };
    
    checkWebPSupport();
    
    // Use Intersection Observer for better lazy loading
    if (imgRef.current && loading === 'lazy') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              // Set the src attribute when the image is about to enter the viewport
              if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
              }
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px 0px' } // Start loading when image is 200px from viewport
      );
      
      observer.observe(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }
  }, [loading]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    
    // Try fallback image if available
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    }
  };
  
  // Determine which source to use
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : 
                  (supportsWebP && webpSrc ? webpSrc : src);
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ 
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : 'auto',
      aspectRatio: width && height ? `${width} / ${height}` : 'auto'
    }}>
      {/* Low-quality placeholder or blur effect while loading */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ 
            width: '100%', 
            height: '100%' 
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={loading === 'lazy' ? undefined : imageSrc}
        data-src={loading === 'lazy' ? imageSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Fallback for no image */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;