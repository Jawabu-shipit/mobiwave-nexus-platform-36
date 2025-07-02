
import React from 'react';
import { AuthContext, AuthContextType } from './auth-provider/AuthContext';
import { useAuthState } from './auth-provider/useAuthState';
import { useAuthActions } from './auth-provider/useAuthActions';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    session,
    isLoading,
    userRole,
    setUser,
    setSession,
    setUserRole,
    setIsLoading
  } = useAuthState();

  const { login, logout } = useAuthActions(setIsLoading, setUser, setSession, setUserRole);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { useAuth } from './auth-provider/AuthContext';
