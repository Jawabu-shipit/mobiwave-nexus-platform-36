import React, { useEffect } from 'react';

/**
 * ResponsiveViewport component
 * 
 * This component handles viewport settings for better mobile responsiveness.
 * It dynamically adjusts the viewport meta tag based on device characteristics
 * and prevents the iOS zoom bug when focusing on inputs.
 */
export const ResponsiveViewport: React.FC = () => {
  useEffect(() => {
    // Function to update viewport meta tag
    const updateViewportMeta = () => {
      // Get the viewport meta tag
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      
      // If it doesn't exist, create it
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      
      // Set the content attribute with appropriate values
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'
      );
    };

    // Function to handle iOS input zoom issue
    const handleIOSInputZoom = () => {
      // Only apply this fix on iOS devices
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOS) {
        // Get all text inputs and textareas
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], textarea');
        
        // Add event listeners to prevent zoom on focus
        textInputs.forEach(input => {
          input.addEventListener('focus', () => {
            // Temporarily adjust the viewport to prevent zoom
            document.querySelector('meta[name="viewport"]')?.setAttribute(
              'content',
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
            );
          });
          
          input.addEventListener('blur', () => {
            // Reset the viewport after blur
            document.querySelector('meta[name="viewport"]')?.setAttribute(
              'content',
              'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'
            );
          });
        });
      }
    };

    // Initialize viewport settings
    updateViewportMeta();
    
    // Handle iOS input zoom issue
    handleIOSInputZoom();
    
    // Update on orientation change
    window.addEventListener('orientationchange', updateViewportMeta);
    
    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', updateViewportMeta);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default ResponsiveViewport;