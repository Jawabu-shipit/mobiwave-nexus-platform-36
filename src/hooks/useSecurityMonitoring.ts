
import { useEffect } from 'react';
import EnhancedSecurityManager from '@/lib/enhanced-security';
import { logSecurityEvent } from '@/lib/security-headers';

export function useSecurityMonitoring() {
  const securityManager = EnhancedSecurityManager.getInstance();

  useEffect(() => {
    // Monitor for suspicious activity
    const monitorActivity = () => {
      // Check for rapid navigation (potential bot behavior)
      let navigationCount = 0;
      const resetCount = () => { navigationCount = 0; };
      
      const navigationHandler = () => {
        navigationCount++;
        if (navigationCount > 10) { // More than 10 navigations in 30 seconds
          logSecurityEvent('rapid_navigation', 'medium', {
            count: navigationCount
          });
        }
      };

      // Monitor session validity
      const sessionMonitor = setInterval(() => {
        if (!securityManager.validateSession()) {
          logSecurityEvent('invalid_session_detected', 'high', {
            timestamp: new Date().toISOString()
          });
        }
      }, 60000); // Check every minute

      // Monitor for XSS attempts
      const xssMonitor = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target && target.innerHTML && /<script|javascript:/i.test(target.innerHTML)) {
          logSecurityEvent('xss_attempt_detected', 'critical', {
            element: target.tagName
          });
        }
      };

      // Add event listeners
      window.addEventListener('popstate', navigationHandler);
      document.addEventListener('DOMSubtreeModified', xssMonitor);
      
      const resetInterval = setInterval(resetCount, 30000);

      return () => {
        window.removeEventListener('popstate', navigationHandler);
        document.removeEventListener('DOMSubtreeModified', xssMonitor);
        clearInterval(sessionMonitor);
        clearInterval(resetInterval);
      };
    };

    const cleanup = monitorActivity();

    // Clean up security caches periodically
    const cacheCleanup = setInterval(() => {
      securityManager.clearSecurityCaches();
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => {
      cleanup();
      clearInterval(cacheCleanup);
    };
  }, [securityManager]);

  return {
    logSecurityEvent: securityManager.logSecurityEvent.bind(securityManager),
    validateSession: securityManager.validateSession.bind(securityManager),
    checkRateLimit: securityManager.checkServerRateLimit.bind(securityManager)
  };
}
