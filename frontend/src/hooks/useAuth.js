import { useState, useCallback, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import {
  saveAuthData,
  clearAuth,
  getToken,
  getUser,
  isAuthenticated as checkAuth,
  isTokenExpired
} from '@/lib/auth';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for authentication
 * Provides methods for login, logout, register, and auth state management
 */
export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (token && !isTokenExpired(token) && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);

      // Save auth data to localStorage
      saveAuthData(response.data);

      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} User data
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);

      // Save auth data to localStorage
      saveAuthData(response.data);

      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Call logout API (optional, depends on backend implementation)
      try {
        await authAPI.logout();
      } catch (err) {
        // Ignore API errors during logout
        console.error('Logout API error:', err);
      }

      // Clear local auth data
      clearAuth();

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Refresh authentication token
   * @returns {Promise<object>} New auth data
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();

      // Save new auth data
      saveAuthData(response.data);

      return response.data;
    } catch (err) {
      // If refresh fails, logout user
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  }, []);

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>} Response data
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Password reset request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise<object>} Response data
   */
  const resetPassword = useCallback(async (token, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.resetPassword(token, password);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update current user data
   * @param {object} userData - Updated user data
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
    // Also update in localStorage
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, []);

  /**
   * Check if token is still valid and refresh if needed
   */
  const checkAuthStatus = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    if (isTokenExpired(token)) {
      try {
        await refreshToken();
        return true;
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    }

    return true;
  }, [refreshToken]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updateUser,
    checkAuthStatus,
    clearError,
  };
};

export default useAuth;
