
import React, { Suspense, lazy } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  minHeight = "400px"
}) => {
  return (
    <div style={{ minHeight }}>
      <Suspense fallback={fallback || <LoadingState size="lg" />}>
        {children}
      </Suspense>
    </div>
  );
};

// Fixed HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoadWrapper fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </LazyLoadWrapper>
  ));
};

// Lazy loaded route components
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazySurveys = lazy(() => import('@/pages/Surveys'));
export const LazyContacts = lazy(() => import('@/pages/Contacts'));
export const LazyCampaignAnalytics = lazy(() => import('@/pages/CampaignAnalytics'));
export const LazySurveyBuilder = lazy(() => import('@/pages/SurveyBuilder'));
