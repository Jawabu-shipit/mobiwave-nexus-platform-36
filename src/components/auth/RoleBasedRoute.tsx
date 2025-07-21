
import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  redirectTo
}) => {
  const { user, userRole, isLoading } = useAuth();

  console.log('RoleBasedRoute - User role:', userRole, 'Allowed roles:', allowedRoles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has one of the allowed roles
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    console.log('Access denied. User role:', userRole, 'Required roles:', allowedRoles);
    
    // If no custom redirect specified, redirect based on user role
    if (!redirectTo) {
      if (userRole === 'super_admin' || userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
