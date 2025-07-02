
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonRows?: number;
}

export function LoadingWrapper({ 
  isLoading, 
  error, 
  children, 
  fallback,
  skeletonRows = 3 
}: LoadingWrapperProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return fallback || (
      <div className="space-y-4">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return <>{children}</>;
}
