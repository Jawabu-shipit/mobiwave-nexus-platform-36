
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, userRole, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setShouldRedirect(true);
    }
  }, [user, isLoading]);

  console.log('ProtectedRoute - User:', !!user, 'Role:', userRole, 'Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/auth" replace />;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    console.log('Role mismatch - Required:', requiredRole, 'User has:', userRole);
    // Redirect to appropriate dashboard based on user's actual role
    if (userRole === 'super_admin' || userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
