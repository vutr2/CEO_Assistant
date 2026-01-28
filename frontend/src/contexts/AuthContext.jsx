'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await userAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Clear invalid token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin' || isOwner;
  const isManager = user?.role === 'manager' || isAdmin;
  const isEmployee = user?.role === 'employee';

  // Check if user can access specific features
  const canViewDashboard = ['owner', 'admin', 'manager'].includes(user?.role);
  const canViewFinance = ['owner', 'admin', 'manager'].includes(user?.role);
  const canViewPeople = ['owner', 'admin', 'manager'].includes(user?.role);
  const canApprove = ['owner', 'admin', 'manager'].includes(user?.role);
  const canManageSettings = ['owner', 'admin'].includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        fetchUser,
        isOwner,
        isAdmin,
        isManager,
        isEmployee,
        canViewDashboard,
        canViewFinance,
        canViewPeople,
        canApprove,
        canManageSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
