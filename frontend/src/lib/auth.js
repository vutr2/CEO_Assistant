/**
 * Authentication utilities
 * Handles token storage, user session, and authentication helpers
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Save refresh token to localStorage
 * @param {string} refreshToken - Refresh token
 */
export const setRefreshToken = (refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token
 */
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Save user data to localStorage
 * @param {object} user - User object
 */
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null} User object
 */
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Clear all authentication data (logout)
 */
export const clearAuth = () => {
  removeToken();
  removeRefreshToken();
  removeUser();
};

/**
 * Parse JWT token to get payload
 * @param {string} token - JWT token
 * @returns {object|null} Token payload
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  // Check if token is expired (with 5 minute buffer)
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  return currentTime > expirationTime - bufferTime;
};

/**
 * Get user role from token
 * @returns {string|null} User role
 */
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.role || null;
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

/**
 * Save complete authentication response
 * @param {object} authData - Authentication data (token, refreshToken, user)
 */
export const saveAuthData = (authData) => {
  // Support both "token" and "accessToken" field names for compatibility
  const { token, accessToken, refreshToken, user } = authData;
  const authToken = token || accessToken;

  if (authToken) setToken(authToken);
  if (refreshToken) setRefreshToken(refreshToken);
  if (user) setUser(user);
};

/**
 * Get all authentication data
 * @returns {object} Object with token, refreshToken, and user
 */
export const getAuthData = () => {
  return {
    token: getToken(),
    refreshToken: getRefreshToken(),
    user: getUser(),
  };
};

export default {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  setUser,
  getUser,
  removeUser,
  isAuthenticated,
  clearAuth,
  parseJwt,
  isTokenExpired,
  getUserRole,
  hasRole,
  hasAnyRole,
  saveAuthData,
  getAuthData,
};
