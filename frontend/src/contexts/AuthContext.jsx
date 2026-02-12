'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDescope, useSession, useUser } from '@descope/react-sdk';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const sdk = useDescope();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !isUserLoading) {
      setLoading(false);
    }
  }, [isSessionLoading, isUserLoading]);

  const logout = async () => {
    try {
      await sdk.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
