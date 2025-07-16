
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingState } from '@/components/common/LoadingState';
import { LazyLoadWrapper } from './LazyLoadWrapper';

// Lazy load all major route components
const LazyDashboard = React.lazy(() => import('@/pages/Dashboard'));
const LazySurveys = React.lazy(() => import('@/pages/Surveys'));
const LazyContacts = React.lazy(() => import('@/pages/Contacts'));
const LazyCampaignAnalytics = React.lazy(() => import('@/pages/CampaignAnalytics'));
const LazySurveyBuilder = React.lazy(() => import('@/pages/SurveyBuilder'));
const LazyMessaging = React.lazy(() => import('@/pages/Messaging'));
const LazyBilling = React.lazy(() => import('@/pages/Billing'));

// Performance monitoring for route changes
const RouteWrapper: React.FC<{ children: React.ReactNode; routeName: string }> = ({ children, routeName }) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`Route ${routeName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    };
  }, [routeName]);

  return <>{children}</>;
};

export const CodeSplitRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <RouteWrapper routeName="Dashboard">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Dashboard..." size="lg" />}>
            <LazyDashboard />
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/surveys" element={
        <RouteWrapper routeName="Surveys">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Surveys..." size="lg" />}>
            <LazySurveys />
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/surveys/builder" element={
        <RouteWrapper routeName="SurveyBuilder">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Survey Builder..." size="lg" />}>
            <LazySurveyBuilder />
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/contacts" element={
        <RouteWrapper routeName="Contacts">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Contacts..." size="lg" />}>
            <LazyContacts />
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/analytics" element={
        <RouteWrapper routeName="Analytics">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Analytics..." size="lg" />}>
            <LazyCampaignAnalytics />
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/messaging/*" element={
        <RouteWrapper routeName="Messaging">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Messaging..." size="lg" />}>
            <Suspense fallback={<LoadingState message="Loading Messaging..." size="lg" />}>
              <LazyMessaging />
            </Suspense>
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
      
      <Route path="/billing" element={
        <RouteWrapper routeName="Billing">
          <LazyLoadWrapper fallback={<LoadingState message="Loading Billing..." size="lg" />}>
            <Suspense fallback={<LoadingState message="Loading Billing..." size="lg" />}>
              <LazyBilling />
            </Suspense>
          </LazyLoadWrapper>
        </RouteWrapper>
      } />
    </Routes>
  );
};
