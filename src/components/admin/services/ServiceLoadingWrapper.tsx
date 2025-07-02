
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ServiceLoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function ServiceLoadingWrapper({ isLoading, children }: ServiceLoadingWrapperProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
